
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

export default function Home() {
  const [language, setLanguage] = useLocalStorage<'ar' | 'en'>('language', 'ar');
  const t = useMemo(() => translations[language], [language]);

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
  } = usePrayerTimes(language, t);

  const {
    notificationsEnabled,
    notificationStatus,
    handleNotificationToggle,
  } = useNotifications(prayerData, language, t);
  
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header 
        title={t.title} 
        language={language} 
        setLanguage={setLanguage} 
        theme={theme}
        setTheme={setTheme}
      />
      <main className="container mx-auto px-4 pb-8">
        {appState === 'loading' && <LoadingState translations={t} />}
        
        {appState === 'geo-fallback' && !prayerData && (
           <GeoFallbackState
            error={error}
            selectedCountry={selectedCountry}
            selectedCity={selectedCity}
            availableCities={availableCities}
            handleCountryChange={handleCountryChange}
            handleCityChange={handleCityChange}
            handleManualLocationSubmit={handleManualLocationSubmit}
            language={language}
            translations={t} loading={false}          />
        )}

        {prayerData && (
          <PrayerTimesView
            prayerData={prayerData}
            displayLocation={displayLocation}
            isLocationModalOpen={isLocationModalOpen}
            setIsLocationModalOpen={setIsLocationModalOpen}
            selectedCountry={selectedCountry}
            selectedCity={selectedCity}
            availableCities={availableCities}
            handleCountryChange={handleCountryChange}
            handleCityChange={handleCityChange}
            handleManualLocationSubmit={handleManualLocationSubmit}
            notificationsEnabled={notificationsEnabled}
            notificationStatus={notificationStatus}
            handleNotificationToggle={handleNotificationToggle}
            language={language}
            translations={t}
            loading={appState === 'loading'}
            appState={appState}
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
