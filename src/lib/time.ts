import { type PrayerTimings } from "@/types/prayer";

export interface Prayer {
  name: string;
  time: string;
  date: Date;
}

export const PRAYER_NAMES: (keyof PrayerTimings)[] = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

export function getPrayerList(timings: PrayerTimings, date: Date): Prayer[] {
  return PRAYER_NAMES.map(name => {
    const timeString = timings[name];
    const [hours, minutes] = timeString.split(':').map(Number);
    const prayerDate = new Date(date);
    prayerDate.setHours(hours, minutes, 0, 0);
    return { name, time: timeString, date: prayerDate };
  });
}

export function findNextPrayer(prayerList: Prayer[], currentTime: Date): Prayer | null {
  const nextPrayer = prayerList.find(prayer => prayer.date > currentTime);
  if (nextPrayer) {
    return nextPrayer;
  }
  // If all prayers for today passed, next is Fajr tomorrow
  const fajrTomorrow = prayerList.find(p => p.name === 'Fajr');
  if (fajrTomorrow) {
    const tomorrow = new Date(fajrTomorrow.date);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return { ...fajrTomorrow, date: tomorrow };
  }
  return null;
}

export function formatCountdown(milliseconds: number): string {
  if (milliseconds < 0) return '00:00:00';

  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map(val => val.toString().padStart(2, '0'))
    .join(':');
}
