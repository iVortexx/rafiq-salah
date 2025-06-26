
'use client';

import { useMemo, useState } from 'react';
import type { PrayerData } from '@/types/prayer';
import { getPrayerList, findNextPrayer, formatCountdown, type Prayer } from '@/lib/time';
import { useCurrentTime } from '@/hooks/useCurrentTime';

import { LocationDisplay } from './LocationDisplay';
import { NextPrayerCard } from './NextPrayerCard';
import { PrayerGrid } from './PrayerGrid';
import { Settings } from './Settings';

interface PrayerTimesViewProps {
  prayerData: PrayerData;
  displayLocation: string;
  onLocationSet: (country: string, city: string) => void;
  notificationsEnabled: boolean;
  notificationStatus: 'default' | 'granted' | 'denied';
  handleNotificationToggle: (checked: boolean) => Promise<void>;
  translations: any;
  language: 'ar' | 'en';
}

export const PrayerTimesView = ({
  prayerData,
  displayLocation,
  onLocationSet,
  notificationsEnabled,
  notificationStatus,
  handleNotificationToggle,
  language,
  translations: t,
}: PrayerTimesViewProps) => {
  const currentTime = useCurrentTime();

  const gregorianDate = useMemo(() => {
    if (!prayerData) return "";
    const { date } = prayerData;
    const dateObj = new Date(parseInt(date.timestamp, 10) * 1000);
    const locale = language === 'ar' ? 'ar-EG-u-nu-latn' : 'en-US';
    return new Intl.DateTimeFormat(locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(dateObj);
  }, [prayerData, language]);

  const hijriDate = useMemo(() => {
    if (!prayerData) return "";
    const { date } = prayerData;
    const locale = language === 'ar' ? 'ar-SA-u-nu-latn' : 'en-US-u-ca-islamic';
    // Use the reliable timestamp to create the date object
    const dateObj = new Date(parseInt(date.timestamp, 10) * 1000);
    return new Intl.DateTimeFormat(locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(dateObj);
  }, [prayerData, language]);

  const prayerList = useMemo(() => {
    if (!prayerData) return [];
    return getPrayerList(prayerData.timings, prayerData.date, language);
  }, [prayerData, language]);

  const { nextPrayer, countdown } = useMemo(() => {
    if (!prayerList.length || !currentTime) {
      return { nextPrayer: null, countdown: '00:00:00' };
    }
    const next = findNextPrayer(prayerList, currentTime);
    const diff = next ? next.date.getTime() - currentTime.getTime() : 0;
    return {
      nextPrayer: next,
      countdown: formatCountdown(diff),
    };
  }, [prayerList, currentTime]);
  
  const prayerTimesToDisplay = useMemo(() => {
    return prayerList.filter(p => p.name !== 'Sunrise' && p.name !== 'Sunset');
  }, [prayerList]);


  return (
    <>
      <LocationDisplay
        gregorianDate={gregorianDate}
        hijriDate={hijriDate}
        displayLocation={displayLocation}
        changeLocationLabel={t.changeLocation}
        onLocationSet={onLocationSet}
        language={language}
        translations={t}
      />

      {nextPrayer && (
        <NextPrayerCard 
          nextPrayer={nextPrayer}
          countdown={countdown}
          nextPrayerLabel={t.nextPrayer}
        />
      )}

      <PrayerGrid 
        prayers={prayerTimesToDisplay}
        nextPrayerName={nextPrayer?.name}
      />

      <Settings
        prayerData={prayerData}
        notificationsEnabled={notificationsEnabled}
        notificationStatus={notificationStatus}
        onNotificationToggle={handleNotificationToggle}
        translations={t}
      />
    </>
  );
};
