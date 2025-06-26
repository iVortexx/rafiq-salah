export interface PrayerTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Sunset: string;
  Maghrib: string;
  Isha: string;
  Imsak: string;
  Midnight: string;
  Firstthird: string;
  Lastthird: string;
}

export interface HijriDate {
  date: string;
  format: string;
  day: string;
  weekday: {
    en: string;
    ar: string;
  };
  month: {
    number: number;
    en: string;
    ar: string;
  };
  year: string;
  designation: {
    abbreviated: string;
    expanded: string;
  };
  holidays: any[];
}

export interface GregorianDate {
  date: string;
  format: string;
  day: string;
  weekday: {
    en: string;
    ar: string;
  };
  month: {
    number: number;
    en: string;
  };
  year: string;
  designation: {
    abbreviated: string;
    expanded: string;
  };
}

export interface DateInfo {
  readable: string;
  timestamp: string;
  hijri: HijriDate;
  gregorian: GregorianDate;
}

export interface Meta {
  latitude: number;
  longitude: number;
  timezone: string;
  method: {
    id: number;
    name: string;
    params: {
      Fajr: number;
      Isha: number;
    };
    location: {
        latitude: number;
        longitude: number;
    }
  };
  latitudeAdjustmentMethod: string;
  midnightMode: string;
  school: string;
  offset: {
    [key: string]: number;
  };
}

export interface PrayerData {
  timings: PrayerTimings;
  date: DateInfo;
  meta: Meta;
}

export interface AladhanResponse {
  code: number;
  status: string;
  data: PrayerData;
}

// App-wide settings type
export type Settings = {
  location: { country: string; city: string } | null;
  notifications: boolean;
  calculationMethod: 'default' | 'mwl' | 'isna' | 'egypt' | 'makkah' | 'karachi' | 'tehran' | 'jafari';
  juristicMethod: 'standard' | 'hanafi';
  highLatitudeAdjustment: 'none' | 'midnight' | 'oneseventh' | 'anglebased';
  hourAdjustment: 0 | 1 | -1;
  prayerAdjustments: { fajr: number; dhuhr: number; asr: number; maghrib: number; isha: number };
  language: 'ar' | 'en';
  theme: 'light' | 'dark';
};
