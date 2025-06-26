'use server';

import type { AladhanResponse } from '@/types/prayer';
import { findNextPrayer, getPrayerListForDate } from './time';
import { translations } from './translations';
import { countries } from './locations';

/**
 * This function checks for upcoming prayers and logs which notifications would be sent.
 * It's designed to be run on a schedule (e.g., every 5 minutes) by a service
 * like a cron job.
 * @param testOffsetMinutes - FOR TESTING ONLY: A number of minutes to check ahead for prayers. Defaults to 5.
 */
export async function checkAndSendPrayerNotifications(testOffsetMinutes?: number) {
  console.log('Running notification check (no Firebase)...');
  // In a real implementation, you would fetch user notification preferences from your own DB.
  // For now, just log that this would be the place to send notifications.
  // Example: [{ location: 'Cairo, Egypt', language: 'ar' }, ...]
  const userNotificationPrefs: { location: string; language: 'ar' | 'en' }[] = [];

  // TODO: Populate userNotificationPrefs from your own data source if needed.

  const notificationWindowMinutes = testOffsetMinutes || 5;
  const isTest = !!testOffsetMinutes;
  const NOTIFICATION_WINDOW_MS = notificationWindowMinutes * 60 * 1000;

  for (const pref of userNotificationPrefs) {
    const [city, country] = pref.location.split(',').map(s => s.trim());
    const language = pref.language;
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
        console.error(`Failed to fetch prayer times for ${pref.location}: ${prayerData.status}`);
        continue;
      }
      const { timings, date: dateInfo } = prayerData.data;
      const locationDateForPrayers = new Date(parseInt(dateInfo.timestamp, 10) * 1000);
      const prayerList = getPrayerListForDate(timings, locationDateForPrayers, language);
      const now = new Date();
      const nextPrayer = findNextPrayer(prayerList, now) as import('./time').Prayer | null;
      if (nextPrayer) {
        const timeToPrayer = nextPrayer.date.getTime() - now.getTime();
        if (timeToPrayer > 0 && timeToPrayer <= NOTIFICATION_WINDOW_MS) {
          const t = translations[language];
          const notificationBody = isTest 
            ? `TEST: Time for ${nextPrayer.displayName} prayer in <${notificationWindowMinutes} mins.`
            : t.prayerTimeIn5Mins(nextPrayer.displayName);
          console.log(`[Notification] Would send: ${notificationBody} to user at ${pref.location} (${language})`);
        }
      }
    } catch (error) {
      console.error(`Error processing location ${pref.location}:`, error);
    }
  }
  console.log('Notification check finished (no Firebase).');
}
