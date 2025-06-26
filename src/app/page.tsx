'use client';

import { useMemo } from 'react';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { useNotifications } from '@/hooks/useNotifications';
import { useLocalStorage } from '@/hooks/use-local-storage';

import { Header } from '@/components/prayer/Header';
import { LoadingState } from '@/components/prayer/LoadingState';
import { GeoFallbackState } from '@/components/prayer/GeoFallbackState';
import { PrayerTimesView } from '@/components/prayer/PrayerTimesView';
import { translations } from '@/lib/translations';

type SettingsType = {
  recommendedSettings: boolean;
  notifications: boolean;
  calculationMethod: 'mwl' | 'isna' | 'egypt' | 'makkah' | 'karachi' | 'tehran' | 'jafari';
  juristicMethod: 'standard' | 'hanafi';
  highLatitudeAdjustment: 'none' | 'midnight' | 'oneseventh' | 'anglebased';
  daylightSaving: '0' | '+1' | '-1';
  prayerAdjustments: { fajr: number; dhuhr: number; asr: number; maghrib: number; isha: number };
  language: 'ar' | 'en';
  theme: 'light' | 'dark';
};

export default function Home() {
  const [language, setLanguage] = useLocalStorage<'ar' | 'en'>('language', 'ar');
  const t = useMemo(() => translations[language], [language]);

  const [settings, setSettings] = useLocalStorage<SettingsType>('settings', {
    recommendedSettings: true,
    notifications: true,
    calculationMethod: 'mwl',
    juristicMethod: 'standard',
    highLatitudeAdjustment: 'none',
    daylightSaving: '0',
    prayerAdjustments: { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },
    language: language,
    theme: 'light',
  });

  // If recommendedSettings is true, use only recommended/default settings for calculation
  const calculationSettings = settings.recommendedSettings
    ? {
        calculationMethod: 'mwl',
        juristicMethod: 'standard',
        highLatitudeAdjustment: 'none',
        daylightSaving: '0',
        prayerAdjustments: { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },
      }
    : settings;

  const {
    appState,
    prayerData,
    error,
    selectedCountry,
    selectedCity,
    availableCities,
    displayLocation,
    isLocationModalOpen,
    setIsLocationModalOpen,
    handleCountryChange,
    handleCityChange,
    handleManualLocationSubmit,
    retryGeolocation,
  } = usePrayerTimes(language, t, calculationSettings);

  const {
    notificationsEnabled,
    notificationStatus,
    handleNotificationToggle,
  } = useNotifications(t);

  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');

  const locationFormProps = {
    selectedCountry,
    selectedCity,
    availableCities,
    loading: appState === 'loading',
    handleCountryChange,
    handleCityChange,
    handleManualLocationSubmit,
    language,
    // translations prop is passed inside GeoFallbackState and PrayerTimesView directly
  };

  // Notification toggle handler for home page
  const handleNotificationToggleHome = async (checked: boolean): Promise<void> => {
    setSettings({ ...settings, notifications: checked });
    await handleNotificationToggle(checked);
  };

  const prayerTimesViewProps = {
    prayerData: prayerData!,
    displayLocation,
    isLocationModalOpen,
    setIsLocationModalOpen,
    notificationsEnabled: settings.notifications,
    notificationStatus,
    handleNotificationToggle: handleNotificationToggleHome,
    translations: t,
    ...locationFormProps,
    appState: appState,
  };

  // Display current settings at the top of the home page
  const calculationMethodLabels: Record<string, string> = {
    mwl: t.mwl,
    isna: t.isna,
    egypt: t.egypt,
    makkah: t.makkah,
    karachi: t.karachi,
    tehran: t.tehran,
    jafari: t.jafari,
  };
  const juristicMethodLabels: Record<string, string> = {
    standard: t.standard,
    hanafi: t.hanafi,
  };
  const highLatitudeLabels: Record<string, string> = {
    none: t.none,
    midnight: t.midnight,
    oneseventh: t.oneseventh,
    anglebased: t.anglebased,
  };
  const daylightSavingLabels: Record<string, string> = {
    '0': t.noAdjustment,
    '+1': t.plusOneHour,
    '-1': t.minusOneHour,
  };
  const calculationMethodLabel: string = calculationMethodLabels[settings.calculationMethod] || settings.calculationMethod;
  const juristicMethodLabel: string = juristicMethodLabels[settings.juristicMethod] || settings.juristicMethod;
  const highLatitudeLabel: string = highLatitudeLabels[settings.highLatitudeAdjustment] || settings.highLatitudeAdjustment;
  const daylightSavingLabel: string = daylightSavingLabels[settings.daylightSaving] || settings.daylightSaving;
  const notificationsLabel: string = settings.notifications ? t.notificationEnabled : t.notificationDisabled;
  const settingsSummary = (
    <div className="my-6 p-4 rounded bg-muted text-muted-foreground">
      <h2 className="font-bold mb-2">{t.prayerSettings}</h2>
      <div className="flex flex-wrap gap-4 text-sm">
        <div><b>{t.calculationMethod}:</b> {calculationMethodLabel}</div>
        <div><b>{t.juristicMethod}:</b> {juristicMethodLabel}</div>
        <div><b>{t.highLatitudeAdjustment}:</b> {highLatitudeLabel}</div>
        <div><b>{t.daylightSavingTime}:</b> {daylightSavingLabel}</div>
        <div><b>{t.notifications}:</b> {notificationsLabel}</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Header
        title={t.title}
        language={language}
        setLanguage={setLanguage}
        theme={theme}
        setTheme={setTheme}
      />
      <main className="container mx-auto px-4 pb-8">
        {appState === 'loading' && <LoadingState />}

        {appState === 'geo-fallback' && (
          <GeoFallbackState
            error={error}
            translations={t}
            locationFormProps={locationFormProps}
            retryGeolocation={retryGeolocation}
          />
        )}

        {appState === 'ready' && prayerData && (
          <>
            <PrayerTimesView {...prayerTimesViewProps} />
            {settingsSummary}
          </>
        )}
      </main>
      <footer className="text-center py-6 border-t mt-8">
        <p className="text-sm text-muted-foreground">
          {t.apiCredit}{' '}
          <a
            href="https://aladhan.com/prayer-times-api"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-primary"
          >
            Aladhan API
          </a>
        </p>
      </footer>
    </div>
  );
}
