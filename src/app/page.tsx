'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { useNotifications } from '@/hooks/useNotifications';
import { useLocalStorage } from '@/hooks/use-local-storage';

import { Header } from '@/components/prayer/Header';
import { LoadingState } from '@/components/prayer/LoadingState';
import { GeoFallbackState } from '@/components/prayer/GeoFallbackState';
import { PrayerTimesView } from '@/components/prayer/PrayerTimesView';
import { translations } from '@/lib/translations';
import type { Settings } from '@/types/prayer';
import { countries } from '@/lib/locations';
import { useToast } from '@/hooks/use-toast';


const defaultSettings: Settings = {
  location: null,
  notifications: true,
  calculationMethod: 'mwl',
  juristicMethod: 'standard',
  highLatitudeAdjustment: 'none',
  hourAdjustment: 0,
  prayerAdjustments: { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },
  language: 'ar',
  theme: 'light',
};


export default function Home() {
  const [settings, setSettings, settingsHydrated] = useLocalStorage<Settings>('settings', defaultSettings);
  const { toast } = useToast();

  const language = settings.language;
  const t = useMemo(() => translations[language], [language]);

  const {
    appState,
    prayerData,
    error,
    displayLocation,
    fetchPrayerTimesByCity,
    fetchPrayerTimesFromCoords,
    setAppState,
    setError,
  } = usePrayerTimes(settings, language, t);

  const {
    notificationsEnabled,
    notificationStatus,
    handleNotificationToggle: hookHandleNotificationToggle,
  } = useNotifications(t);


  useEffect(() => {
    if (!settingsHydrated) return; // Wait for settings to load from localStorage

    if (settings.location?.city && settings.location?.country) {
      fetchPrayerTimesByCity(settings.location.city, settings.location.country);
    } else {
      // First time user or no location saved, try geolocation
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            fetchPrayerTimesFromCoords(position.coords.latitude, position.coords.longitude)
              .then(location => {
                if (location) {
                  // Geolocation was successful, save the new location
                  setSettings(prev => ({...prev, location: { country: location.country, city: location.city }}));
                  toast({ title: t.locationSet, description: `${location.city}, ${location.country}`});
                }
              });
          },
          (err) => {
            setError(t.locationAccessDeniedDesc);
            toast({ title: t.locationAccessDenied, description: err.message, variant: "destructive" });
            setAppState('geo-fallback');
          }
        );
      } else {
        setError(t.geolocationNotSupportedDesc);
        toast({ title: t.geolocationNotSupported, description: t.geolocationNotSupportedDesc, variant: "destructive" });
        setAppState('geo-fallback');
      }
    }
  }, [settingsHydrated]); // Run only once when settings are loaded

  const handleManualLocationSelect = (countryName: string, cityName: string) => {
    const countryData = countries.find(c => c.name === countryName || c.arabicName === countryName);
    const cityData = countryData?.cities.find(c => c.name === cityName || c.arabicName === cityName);

    if (countryData && cityData) {
      setSettings(prev => ({
        ...prev,
        location: {
          country: countryData.name, // Save canonical English name
          city: cityData.name,      // Save canonical English name
        }
      }));
      fetchPrayerTimesByCity(cityData.name, countryData.name);
    }
  };

  const retryGeolocation = () => {
    setAppState('loading');
    setError(null);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchPrayerTimesFromCoords(position.coords.latitude, position.coords.longitude)
            .then(location => {
              if (location) {
                setSettings(prev => ({...prev, location: { country: location.country, city: location.city }}));
                toast({ title: t.locationSet, description: `${location.city}, ${location.country}`});
              }
            });
        },
        () => {
          setError(t.locationAccessDeniedDesc);
          toast({ title: t.locationAccessDenied, description: t.locationAccessDeniedDesc, variant: "destructive" });
          setAppState('geo-fallback');
        }
      );
    } else {
      setError(t.geolocationNotSupportedDesc);
      toast({ title: t.geolocationNotSupported, description: t.geolocationNotSupportedDesc, variant: "destructive" });
      setAppState('geo-fallback');
    }
  };

  const handleNotificationToggleHome = async (checked: boolean): Promise<void> => {
    setSettings({ ...settings, notifications: checked });
    await hookHandleNotificationToggle(checked);
  };
  
  const handleLanguageChange = (lang: 'ar' | 'en') => {
    setSettings(prev => ({...prev, language: lang}));
  }

  const handleThemeChange = (theme: 'light' | 'dark') => {
    setSettings(prev => ({...prev, theme: theme}));
  }


  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Header
        title={t.title}
        language={settings.language}
        setLanguage={handleLanguageChange}
        theme={settings.theme}
        setTheme={handleThemeChange}
      />
      <main className="container mx-auto px-4 pb-8">
        {appState === 'loading' && <LoadingState />}

        {appState === 'geo-fallback' && (
          <GeoFallbackState
            error={error}
            translations={t}
            onLocationSet={handleManualLocationSelect}
            retryGeolocation={retryGeolocation}
            language={language}
          />
        )}

        {appState === 'ready' && prayerData && (
          <PrayerTimesView 
            prayerData={prayerData}
            displayLocation={displayLocation}
            onLocationSet={handleManualLocationSelect}
            notificationsEnabled={settings.notifications}
            notificationStatus={notificationStatus}
            handleNotificationToggle={handleNotificationToggleHome}
            translations={t}
            language={language}
          />
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
