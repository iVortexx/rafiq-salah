
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from "@/hooks/use-toast";
import type { AladhanResponse, PrayerData } from '@/types/prayer';
import { getPrayerList, findNextPrayer, formatCountdown, type Prayer } from '@/lib/time';
import { countries, type City, type Country } from '@/lib/locations';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Header } from '@/components/prayer/Header';
import { LocationDisplay } from '@/components/prayer/LocationDisplay';
import { NextPrayerCard } from '@/components/prayer/NextPrayerCard';
import { PrayerGrid } from '@/components/prayer/PrayerGrid';
import { Settings } from '@/components/prayer/Settings';
import { LocationForm } from '@/components/prayer/LocationForm';

const translations = {
  ar: {
    title: "رفيق الصلاة",
    loadingLocation: "جاري تحديد موقعك...",
    welcome: "أهلاً بك في رفيق الصلاة",
    manualLocationPrompt: "الرجاء تحديد موقعك لعرض أوقات الصلاة.",
    changeLocation: "تغيير الموقع",
    nextPrayer: "الصلاة القادمة",
    prayerNotifications: "إشعارات الصلاة",
    notificationDesc: "لتلقي إشعار قبل 5 دقائق من كل صلاة. لا يمكن إيقافها إلا من إعدادات المتصفح.",
    enableNotifications: "تفعيل الإشعارات",
    calculationInfo: "معلومات الحساب",
    calculationMethodDesc: "طريقة حساب أوقات الصلاة المستخدمة.",
    method: "الطريقة",
    apiCredit: "أوقات الصلاة مقدمة من",
    country: "الدولة",
    city: "المدينة",
    selectCountry: "اختر دولة",
    selectCity: "اختر مدينة",
    searchCountry: "ابحث عن دولة...",
    searchCity: "ابحث عن مدينة...",
    countryNotFound: "لم يتم العثور على الدولة.",
    cityNotFound: "لم يتم العثور على مدينة.",
    getPrayerTimes: "الحصول على أوقات الصلاة",
    notificationEnabled: "تم التفعيل",
    notificationEnabledDesc: "إشعارات الصلاة مفعلة الآن.",
    notificationDisabled: "تم التعطيل",
    notificationDisabledDesc: "تم إيقاف إشعارات الصلاة.",
    notificationBlocked: "محظور",
    notificationBlockedDesc: "الإشعارات محظورة. يرجى تفعيلها في إعدادات المتصفح.",
    notificationRequestSuccess: "نجاح!",
    notificationRequestSuccessDesc: "تم تفعيل الإشعارات بنجاح.",
    notificationRequestFailed: "تم الرفض",
    notificationRequestFailedDesc: "لم يتم منح إذن الإشعارات.",
    notificationError: "خطأ",
    notificationErrorDesc: "حدث خطأ أثناء طلب إذن الإشعارات.",
    notificationNotSupported: "غير مدعوم",
    notificationNotSupportedDesc: "هذا المتصفح لا يدعم إشعارات سطح المكتب.",
    prayerTimeIn5Mins: (prayerName: string) => `صلاة ${prayerName} بعد 5 دقائق.`,
    prayerTimeNow: "حان وقت الصلاة",
    locationAccessDenied: "تم رفض الوصول للموقع",
    locationAccessDeniedDesc: "يرجى تحديد موقعك يدويًا لعرض أوقات الصلاة.",
    geolocationNotSupported: "تحديد الموقع غير مدعوم",
    geolocationNotSupportedDesc: "متصفحك لا يدعم هذه الميزة. يرجى تحديد موقعك يدويًا.",
    cityNotMatched: "لم نتمكن من مطابقة مدينتك",
  },
  en: {
    title: "Prayer Pal",
    loadingLocation: "Determining your location...",
    welcome: "Welcome to Prayer Pal",
    manualLocationPrompt: "Please select your location to display prayer times.",
    changeLocation: "Change Location",
    nextPrayer: "Next Prayer",
    prayerNotifications: "Prayer Notifications",
    notificationDesc: "Get notified 5 minutes before each prayer. Can only be disabled from browser settings.",
    enableNotifications: "Enable Notifications",
    calculationInfo: "Calculation Info",
    calculationMethodDesc: "The method used for prayer time calculation.",
    method: "Method",
    apiCredit: "Prayer times provided by",
    country: "Country",
    city: "City",
    selectCountry: "Select a country",
    selectCity: "Select a city",
    searchCountry: "Search for a country...",
    searchCity: "Search for a city...",
    countryNotFound: "Country not found.",
    cityNotFound: "City not found.",
    getPrayerTimes: "Get Prayer Times",
    notificationEnabled: "Enabled",
    notificationEnabledDesc: "Prayer notifications are now active.",
    notificationDisabled: "Disabled",
    notificationDisabledDesc: "Prayer notifications have been turned off.",
    notificationBlocked: "Blocked",
    notificationBlockedDesc: "Notifications are blocked. Please enable them in your browser settings.",
    notificationRequestSuccess: "Success!",
    notificationRequestSuccessDesc: "Notifications have been enabled successfully.",
    notificationRequestFailed: "Denied",
    notificationRequestFailedDesc: "Notification permission was not granted.",
    notificationError: "Error",
    notificationErrorDesc: "An error occurred while requesting notification permission.",
    notificationNotSupported: "Not Supported",
    notificationNotSupportedDesc: "This browser does not support desktop notifications.",
    prayerTimeIn5Mins: (prayerName: string) => `Time for ${prayerName} prayer in 5 minutes.`,
    prayerTimeNow: "Prayer Time",
    locationAccessDenied: "Location Access Denied",
    locationAccessDeniedDesc: "Please select your location manually to continue.",
    geolocationNotSupported: "Geolocation Not Supported",
    geolocationNotSupportedDesc: "Your browser does not support this feature. Please select your location manually.",
    cityNotMatched: "Could not match your city",
  }
};

type AppState = 'loading' | 'ready' | 'error' | 'geo-fallback';

export default function Home() {
  const [appState, setAppState] = useState<AppState>('loading');
  const [prayerData, setPrayerData] = useState<PrayerData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [availableCities, setAvailableCities] = useState<City[]>([]);

  const [displayLocation, setDisplayLocation] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<'default' | 'granted' | 'denied'>('default');

  const { toast } = useToast();
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  const t = useMemo(() => translations[language], [language]);

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
    return language === 'ar' ? `${date.hijri.weekday.ar}, ${date.hijri.day} ${date.hijri.month.ar} ${date.hijri.year} هـ` : `${date.hijri.weekday.en}, ${date.hijri.day} ${date.hijri.month.en} ${date.hijri.year} AH`;
  }, [prayerData, language]);


  useEffect(() => {
    const savedLang = localStorage.getItem('language');
    if (savedLang === 'en' || savedLang === 'ar') {
        setLanguage(savedLang);
    }
    
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  useEffect(() => {
      document.documentElement.lang = language;
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);
  
  const fetchPrayerTimesByCity = useCallback(async (city: string, countryName: string) => {
    setAppState('loading');
    setError(null);
  
    try {
      const countryData = countries.find(c => c.name === countryName);
      if (!countryData) throw new Error("Invalid country selected.");
  
      const cityData = countryData.cities.find(c => c.name === city || c.arabicName === city);
      if (!cityData) throw new Error("Invalid city selected.");
      
      const method = countryData.method;
      const today = new Date();
      const dateString = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
  
      const url = `https://api.aladhan.com/v1/timingsByCity/${dateString}?city=${cityData.arabicName}&country=${countryData.arabicName}&method=${method}`;
  
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch prayer times. Please check your internet connection.');
      const data: AladhanResponse = await response.json();
      if (data.code !== 200) throw new Error(data.status || 'An unknown error occurred.');
      
      setPrayerData(data.data);
      
      const countryDisplayName = language === 'ar' ? countryData.arabicName : countryData.name;
      const cityDisplayName = language === 'ar' ? cityData.arabicName : cityData.name;
      
      setDisplayLocation(`${cityDisplayName}, ${countryDisplayName}`);
      setSelectedCountry(countryData.name);
      setSelectedCity(cityData.name);
      setAvailableCities(countryData.cities);
      setAppState('ready');
      setIsLocationModalOpen(false);
  
    } catch (e: any) {
      setError(e.message);
      setAppState('geo-fallback');
      toast({ variant: "destructive", title: t.notificationError, description: e.message });
    }
  }, [toast, language, t.notificationError]);

  const fetchPrayerTimesFromCoords = useCallback(async (latitude: number, longitude: number) => {
    setAppState('loading');
    setError(null);
  
    try {
      const geoResponse = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
      if (!geoResponse.ok) throw new Error('Failed to use reverse geocoding service.');
      
      const geoData = await geoResponse.json();
      const apiCity = geoData.city || geoData.locality;
      const countryCode = geoData.countryCode;
      
      const countryData = countries.find(c => c.code === countryCode);
      
      if (!countryData || !apiCity) {
        setAppState('geo-fallback');
        setError(t.manualLocationPrompt);
        return;
      }
      
      const matchedCityData = countryData.cities.find(c => c.name.toLowerCase() === apiCity.toLowerCase());

      if (!matchedCityData) {
        setAppState('geo-fallback');
        const errorMessage = `${t.cityNotMatched}: "${apiCity}". ${t.manualLocationPrompt}`;
        setError(errorMessage);
        toast({ variant: "destructive", title: t.cityNotMatched, description: `Could not automatically match your city "${apiCity}". Please select it manually.` });
        
        const countryDisplayName = language === 'ar' ? countryData.arabicName : countryData.name;
        setSelectedCountry(countryDisplayName);
        setAvailableCities(countryData.cities);
        setSelectedCity('');
        return;
      }
      
      await fetchPrayerTimesByCity(matchedCityData.name, countryData.name);
  
    } catch (e: any) {
      setError(e.message);
      setAppState('geo-fallback');
      toast({ variant: "destructive", title: t.notificationError, description: e.message });
    }
  }, [toast, t.notificationError, t.manualLocationPrompt, t.cityNotMatched, fetchPrayerTimesByCity, language]);
  
  
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchPrayerTimesFromCoords(position.coords.latitude, position.coords.longitude);
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
  }, [fetchPrayerTimesFromCoords, toast, t]);
  
  useEffect(() => {
    if ('Notification' in window) {
      const status = Notification.permission;
      setNotificationStatus(status);
      if (status === 'granted') {
        setNotificationsEnabled(true);
      }
    }
  }, []);


  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const prayerList = useMemo(() => {
    if (!prayerData) return [];
    return getPrayerList(prayerData.timings, new Date(parseInt(prayerData.date.timestamp, 10) * 1000), language);
  }, [prayerData, language]);
  
  const { nextPrayer, countdown } = useMemo(() => {
    if (!prayerList.length) return { nextPrayer: null, countdown: '00:00:00' };
    const next = findNextPrayer(prayerList, currentTime);
    const diff = next ? next.date.getTime() - currentTime.getTime() : 0;
    return {
      nextPrayer: next as Prayer,
      countdown: formatCountdown(diff),
    };
  }, [prayerList, currentTime]);
  
  const prayerTimesToDisplay = useMemo(() => {
    return prayerList.filter(p => p.name !== 'Sunrise' && p.name !== 'Sunset');
  }, [prayerList]);
  
  useEffect(() => {
      const timeoutIds = (window as any).prayerNotificationTimeouts || [];
      timeoutIds.forEach(clearTimeout);
      (window as any).prayerNotificationTimeouts = [];
  
      if (notificationsEnabled && prayerList.length > 0 && 'Notification' in window && Notification.permission === 'granted') {
          const now = new Date();
          const newTimeoutIds: NodeJS.Timeout[] = [];
  
          prayerList.forEach(prayer => {
              if (prayer.name === 'Sunrise' || prayer.name === 'Sunset') return;

              const notificationTime = prayer.date.getTime() - 5 * 60 * 1000;
              if (notificationTime > now.getTime()) {
                  const timeoutId = setTimeout(() => {
                      new Notification(t.prayerTimeNow, { 
                        body: t.prayerTimeIn5Mins(prayer.displayName), 
                        dir: language === 'ar' ? 'rtl' : 'ltr'
                      });
                  }, notificationTime - now.getTime());
                  newTimeoutIds.push(timeoutId);
              }
          });
          (window as any).prayerNotificationTimeouts = newTimeoutIds;
      }
  
      return () => {
          const timeoutIdsToClear = (window as any).prayerNotificationTimeouts || [];
          timeoutIdsToClear.forEach(clearTimeout);
      };
  }, [notificationsEnabled, prayerList, language, t]);


  const handleCountryChange = useCallback((countryIdentifier: string) => {
    const countryData = countries.find(c => c.name === countryIdentifier || c.arabicName === countryIdentifier);
    if (countryData) {
      const countryDisplayName = language === 'ar' ? countryData.arabicName : countryData.name;
      setSelectedCountry(countryDisplayName);
      setAvailableCities(countryData.cities);
      setSelectedCity('');
    }
  }, [language]);
  
  const handleCityChange = useCallback((cityIdentifier: string) => {
    const cityData = availableCities.find(c => c.name === cityIdentifier || c.arabicName === cityIdentifier);
    if (cityData) {
        const cityDisplayName = language === 'ar' ? cityData.arabicName : cityData.name;
        setSelectedCity(cityDisplayName);
    }
  }, [availableCities, language]);

  const handleManualLocationSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const countryData = countries.find(c => c.name === selectedCountry || c.arabicName === selectedCountry);
    if (selectedCity && countryData) {
      fetchPrayerTimesByCity(selectedCity, countryData.name);
    }
  }, [selectedCity, selectedCountry, fetchPrayerTimesByCity]);

  const handleNotificationToggle = async (checked: boolean) => {
    if (!('Notification' in window)) {
        toast({ variant: "destructive", title: t.notificationNotSupported, description: t.notificationNotSupportedDesc });
        return;
    }

    if (notificationStatus === 'denied') {
        toast({ variant: "destructive", title: t.notificationBlocked, description: t.notificationBlockedDesc });
        return;
    }
    
    if (notificationStatus === 'granted') {
        setNotificationsEnabled(true);
        toast({ title: t.notificationEnabled, description: t.notificationEnabledDesc });
        return;
    }

    if (checked) {
        try {
            const permission = await Notification.requestPermission();
            setNotificationStatus(permission);
            if (permission === 'granted') {
                setNotificationsEnabled(true);
                toast({ title: t.notificationRequestSuccess, description: t.notificationRequestSuccessDesc });
            } else {
                setNotificationsEnabled(false);
                toast({ variant: "destructive", title: t.notificationRequestFailed, description: t.notificationRequestFailedDesc });
            }
        } catch (error) {
            setNotificationsEnabled(false);
            toast({ variant: "destructive", title: t.notificationError, description: t.notificationErrorDesc });
        }
    }
  };
  
  if (appState === 'loading') {
    return (
       <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
        <Loader2 className="w-16 h-16 animate-spin text-primary" />
        <p className="mt-4 text-lg font-semibold">{t.loadingLocation}</p>
      </div>
    );
  }

  if (appState === 'geo-fallback' && !prayerData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
        <Card className="w-full max-w-md mx-4 p-4 shadow-lg">
          <CardHeader>
            <CardTitle className="font-bold text-center text-3xl text-primary">{t.welcome}</CardTitle>
            <CardDescription className="text-center text-muted-foreground pt-2">
              {error || t.manualLocationPrompt}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LocationForm 
              selectedCountry={selectedCountry}
              selectedCity={selectedCity}
              availableCities={availableCities}
              loading={appState === 'loading'}
              handleCountryChange={handleCountryChange}
              handleCityChange={handleCityChange}
              handleManualLocationSubmit={handleManualLocationSubmit}
              language={language}
              translations={t}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!prayerData) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header title={t.title} language={language} setLanguage={setLanguage} />

      <main className="container mx-auto px-4 pb-8">
        
        <LocationDisplay
          gregorianDate={gregorianDate}
          hijriDate={hijriDate}
          displayLocation={displayLocation}
          isLocationModalOpen={isLocationModalOpen}
          setIsLocationModalOpen={setIsLocationModalOpen}
          changeLocationLabel={t.changeLocation}
          locationFormProps={{
            selectedCountry: selectedCountry,
            selectedCity: selectedCity,
            availableCities: availableCities,
            loading: appState === 'loading',
            handleCountryChange: handleCountryChange,
            handleCityChange: handleCityChange,
            handleManualLocationSubmit: handleManualLocationSubmit,
            language: language,
            translations: t,
          }}
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

      </main>
      <footer className="text-center py-6 border-t mt-8">
        <p className="text-sm text-muted-foreground">
            {t.apiCredit} <a href="https://aladhan.com/prayer-times-api" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Aladhan API</a>
        </p>
      </footer>
    </div>
  );
}
