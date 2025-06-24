
'use server';

import { firestore, messagingAdmin } from './firebase-admin';
import type { AladhanResponse } from '@/types/prayer';
import { findNextPrayer, PRAYER_NAMES, ARABIC_PRAYER_NAME_MAP } from './time';
import { translations } from './translations';
import { countries } from './locations';

/**
 * This function checks for upcoming prayers and sends notifications.
 * It's designed to be run on a schedule (e.g., every 5 minutes) by a service
 * like Firebase Scheduled Functions or a cron job.
 */
export async function checkAndSendPrayerNotifications() {
  console.log('Running notification check...');
  const tokensSnapshot = await firestore.collection('fcmTokens').get();

  if (tokensSnapshot.empty) {
    console.log('No tokens found.');
    return;
  }

  const locationGroups: { [key: string]: { tokens: string[]; language: 'ar' | 'en' } } = {};
  tokensSnapshot.forEach(doc => {
    const data = doc.data();
    if (data.location && data.language) {
      const key = `${data.location}|${data.language}`;
      if (!locationGroups[key]) {
        locationGroups[key] = { tokens: [], language: data.language };
      }
      locationGroups[key].tokens.push(doc.id);
    }
  });

  const now = new Date();

  for (const groupKey in locationGroups) {
    const [location, lang] = groupKey.split('|');
    const [city, country] = location.split(',').map(s => s.trim());
    const language = lang as 'ar' | 'en';

    if (!city || !country) continue;

    try {
      const countryData = countries.find(c => c.name === country || c.arabicName === country);
      if (!countryData) {
        console.warn(`Could not find country data for: ${country}`);
        continue;
      }
      
      const cityData = countryData.cities.find(c => c.name === city || c.arabicName === city);
       if (!cityData) {
        console.warn(`Could not find city data for: ${city} in ${country}`);
        continue;
      }
      
      const method = countryData.method;
      const today = new Date();
      const dateString = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;

      const url = `https://api.aladhan.com/v1/timingsByCity/${dateString}?city=${cityData.arabicName}&country=${countryData.arabicName}&method=${method}`;
      const response = await fetch(url);
      const prayerData: AladhanResponse = await response.json();

      if (prayerData.code !== 200) {
        console.error(`Failed to fetch prayer times for ${location}: ${prayerData.status}`);
        continue;
      }

      const { timings, date: dateInfo } = prayerData.data;
      const midnightInLocation = new Date(parseInt(dateInfo.timestamp, 10) * 1000);

      const prayerList = PRAYER_NAMES.map(name => {
          const timeString24 = timings[name as keyof typeof timings];
          const [hours, minutes] = timeString24.split(':').map(Number);
          
          const prayerDate = new Date(midnightInLocation.getTime());
          prayerDate.setHours(hours, minutes, 0, 0);

          return {
            name,
            displayName: language === 'ar' ? ARABIC_PRAYER_NAME_MAP[name] : name,
            date: prayerDate
          };
      });
      
      const nextPrayer = findNextPrayer(prayerList, now);

      if (nextPrayer) {
        const timeToPrayer = nextPrayer.date.getTime() - now.getTime();
        const minutesToPrayer = Math.round(timeToPrayer / (1000 * 60));

        if (minutesToPrayer === 0) {
          const { tokens } = locationGroups[groupKey];
          const t = translations[language];

          const messagePayload = {
            notification: {
              title: t.prayerTimeNow,
              body: t.prayerTimeIn5Mins(nextPrayer.displayName),
              icon: '/icon-192x192.png'
            },
            webpush: {
                fcm_options: {
                    link: '/'
                }
            },
            tokens: tokens,
          };

          console.log(`Sending notification for ${nextPrayer.displayName} to ${tokens.length} users in ${location}`);
          const batchResponse = await messagingAdmin.sendEachForMulticast(messagePayload);
          
          if (batchResponse.failureCount > 0) {
            const tokensToDelete: Promise<any>[] = [];
            batchResponse.responses.forEach((resp, idx) => {
              if (!resp.success) {
                const errorCode = resp.error?.code;
                // Check for errors indicating the token is no longer valid
                if (errorCode === 'messaging/registration-token-not-registered') {
                  const failedToken = tokens[idx];
                  console.log(`Token ${failedToken} is no longer registered. Deleting.`);
                  tokensToDelete.push(firestore.collection('fcmTokens').doc(failedToken).delete());
                }
              }
            });
            await Promise.all(tokensToDelete);
          }
        }
      }
    } catch (error) {
      console.error(`Error processing location ${location}:`, error);
    }
  }

  console.log('Notification check finished.');
}
