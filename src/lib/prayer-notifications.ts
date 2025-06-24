
'use server';

import { firestore, messagingAdmin } from './firebase-admin';
import type { AladhanResponse } from '@/types/prayer';
import { findNextPrayer, getPrayerListForDate } from './time';
import { translations } from './translations';
import { countries } from './locations';

/**
 * This function checks for upcoming prayers and sends notifications.
 * It's designed to be run on a schedule (e.g., every 5 minutes) by a service
 * like Firebase Scheduled Functions or a cron job.
 * @param testOffsetMinutes - FOR TESTING ONLY: A number of minutes to check ahead for prayers. Defaults to 5.
 */
export async function checkAndSendPrayerNotifications(testOffsetMinutes?: number) {
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

  const notificationWindowMinutes = testOffsetMinutes || 5;
  const isTest = !!testOffsetMinutes;
  const NOTIFICATION_WINDOW_MS = notificationWindowMinutes * 60 * 1000;


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
      // Use the current date for the API call
      const today = new Date();
      const dateString = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;

      const url = `https://api.aladhan.com/v1/timingsByCity/${dateString}?city=${cityData.arabicName}&country=${countryData.arabicName}&method=${method}`;
      const response = await fetch(url);
      const prayerData: AladhanResponse = await response.json();

      if (prayerData.code !== 200) {
        console.error(`Failed to fetch prayer times for ${location}: ${prayerData.status}`);
        continue;
      }

      const { timings, meta } = prayerData.data;
      
      // Crucial: Create a date object representing the current moment *in the prayer's local timezone*.
      const nowInLocationTimezone = new Date(new Date().toLocaleString('en-US', { timeZone: meta.timezone }));
      
      const prayerList = getPrayerListForDate(timings, nowInLocationTimezone, language);
      const nextPrayer = findNextPrayer(prayerList, nowInLocationTimezone);

      if (nextPrayer) {
        const timeToPrayer = nextPrayer.date.getTime() - nowInLocationTimezone.getTime();

        // Check if the next prayer is within our notification window
        if (timeToPrayer > 0 && timeToPrayer <= NOTIFICATION_WINDOW_MS) {
          const { tokens } = locationGroups[groupKey];
          const t = translations[language];

          const notificationBody = isTest 
            ? `TEST: Time for ${nextPrayer.displayName} prayer in <${notificationWindowMinutes} mins.`
            : t.prayerTimeIn5Mins(nextPrayer.displayName);

          const messagePayload = {
            notification: {
              title: t.prayerTimeNow,
              body: notificationBody,
              icon: '/icon-192x192.png'
            },
            webpush: {
                fcm_options: {
                    link: '/'
                }
            },
            tokens: tokens,
          };

          console.log(`Sending notification for ${nextPrayer.displayName} (in <${notificationWindowMinutes} mins) to ${tokens.length} users in ${location}`);
          const batchResponse = await messagingAdmin.sendEachForMulticast(messagePayload);
          
          // Clean up invalid tokens after sending
          if (batchResponse.failureCount > 0) {
            const tokensToDelete: Promise<any>[] = [];
            batchResponse.responses.forEach((resp, idx) => {
              if (!resp.success) {
                const errorCode = resp.error?.code;
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
