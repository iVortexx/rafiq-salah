import { type PrayerTimings } from "@/types/prayer";

export interface Prayer {
  name: string;
  displayName: string;
  time: string;
  date: Date;
}

const PRAYER_NAMES: (keyof PrayerTimings)[] = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Sunset', 'Maghrib', 'Isha'];

const ARABIC_PRAYER_NAME_MAP: { [key: string]: string } = {
  Fajr: 'الفجر',
  Sunrise: 'الشروق',
  Dhuhr: 'الظهر',
  Asr: 'العصر',
  Sunset: 'الغروب',
  Maghrib: 'المغرب',
  Isha: 'العشاء',
};

function formatTo12Hour(timeString: string, lang: 'ar' | 'en'): string {
  if (!timeString) return '';
  const [hours, minutes] = timeString.split(':').map(Number);
  const period = hours >= 12 ? (lang === 'ar' ? 'م' : 'PM') : (lang === 'ar' ? 'ص' : 'AM');
  let hours12 = hours % 12;
  if (hours12 === 0) hours12 = 12; // Convert 0 to 12
  
  const formattedMinutes = minutes.toString().padStart(2, '0');

  return `${hours12}:${formattedMinutes} ${period}`;
}

export function getPrayerList(timings: PrayerTimings, date: Date, lang: 'ar' | 'en'): Prayer[] {
  return PRAYER_NAMES.map(name => {
    const timeString24 = timings[name];
    const [hours, minutes] = timeString24.split(':').map(Number);
    const prayerDate = new Date(date);
    prayerDate.setHours(hours, minutes, 0, 0);
    return { 
      name, 
      displayName: lang === 'ar' ? ARABIC_PRAYER_NAME_MAP[name] : name,
      time: formatTo12Hour(timeString24, lang), 
      date: prayerDate 
    };
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
