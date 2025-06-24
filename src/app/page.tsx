
'use client';

import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { AladhanResponse, PrayerData } from '@/types/prayer';
import { getPrayerList, findNextPrayer, formatCountdown, type Prayer } from '@/lib/time';
import { countries, type City, type Country } from '@/lib/locations';
import { Sun, MapPin, Bell, Loader2, Pencil, Check, ChevronsUpDown, MoonIcon, SunIcon, Languages, ChevronDown } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandList, CommandItem } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

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
  }
};

interface LocationFormProps {
  selectedCountry: string;
  selectedCity: string;
  availableCities: City[];
  loading: boolean;
  handleCountryChange: (countryName: string) => void;
  handleCityChange: (cityName: string) => void;
  handleManualLocationSubmit: (e: React.FormEvent) => void;
  language: 'ar' | 'en';
}

const LocationForm = memo(({
  selectedCountry,
  selectedCity,
  availableCities,
  loading,
  handleCountryChange,
  handleCityChange,
  handleManualLocationSubmit,
  language,
}: LocationFormProps) => {
  const [countryOpen, setCountryOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const t = translations[language];

  const selectedCountryData = useMemo(() => countries.find(c => c.name === selectedCountry), [selectedCountry]);
  const selectedCityData = useMemo(() => availableCities.find(c => c.name.toLowerCase() === selectedCity.toLowerCase()), [availableCities, selectedCity]);

  return (
   <form onSubmit={handleManualLocationSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>{t.country}</Label>
        <Popover open={countryOpen} onOpenChange={setCountryOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" aria-expanded={countryOpen} className="w-full justify-between text-base md:text-sm">
              {selectedCountryData ? (language === 'ar' ? selectedCountryData.arabicName : selectedCountryData.name) : t.selectCountry}
              <ChevronsUpDown className="ms-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" position="popper">
            <Command>
              <CommandInput placeholder={t.searchCountry} />
              <CommandList>
                <CommandEmpty>{t.countryNotFound}</CommandEmpty>
                <CommandGroup>
                  {countries.map((country) => (
                    <CommandItem
                      key={country.name}
                      value={language === 'ar' ? country.arabicName : country.name}
                      onSelect={(currentValue) => {
                         handleCountryChange(currentValue);
                         setCountryOpen(false);
                      }}
                    >
                      <Check className={cn("me-2 h-4 w-4", selectedCountry === country.name ? "opacity-100" : "opacity-0")} />
                      {language === 'ar' ? country.arabicName : country.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      <div className="space-y-2">
        <Label>{t.city}</Label>
        <Popover open={cityOpen} onOpenChange={setCityOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" aria-expanded={cityOpen} className="w-full justify-between text-base md:text-sm" disabled={!selectedCountry}>
              {selectedCityData ? (language === 'ar' ? selectedCityData.arabicName : selectedCityData.name) : t.selectCity}
              <ChevronsUpDown className="ms-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" position="popper">
             <Command>
              <CommandInput placeholder={t.searchCity} />
               <CommandList>
                <CommandEmpty>{t.cityNotFound}</CommandEmpty>
                <CommandGroup>
                  {availableCities.map((city) => (
                    <CommandItem
                      key={city.name}
                      value={city.name}
                      onSelect={(currentValue) => {
                        handleCityChange(currentValue);
                        setCityOpen(false);
                      }}
                    >
                      <Check className={cn("me-2 h-4 w-4", selectedCity.toLowerCase() === city.name.toLowerCase() ? "opacity-100" : "opacity-0")} />
                      {language === 'ar' ? city.arabicName : city.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      <Button type="submit" className="w-full" disabled={loading || !selectedCity || !selectedCountry}>
        {loading ? <Loader2 className="ms-2 h-4 w-4 animate-spin" /> : <MapPin className="ms-2 h-4 w-4" />}
        {t.getPrayerTimes}
      </Button>
    </form>
  );
});
LocationForm.displayName = 'LocationForm';

const ThemeSwitcher = () => {
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
        document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
    };

    return (
        <Button onClick={toggleTheme} variant="ghost" size="icon">
            <SunIcon className="h-6 w-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <MoonIcon className="absolute h-6 w-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
};

const USFlag = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="18" viewBox="0 0 24 18" className="rounded-sm">
    <path fill="#0A3161" d="M0 0h12v10H0z"/>
    <path fill="#FFF" d="M1.5 1.5h1v1h-1z m3 0h1v1h-1z m3 0h1v1h-1z m3 0h1v1h-1z m-9 2h1v1h-1z m3 0h1v1h-1z m3 0h1v1h-1z m3 0h1v1h-1z m-9 2h1v1h-1z m3 0h1v1h-1z m3 0h1v1h-1z m3 0h1v1h-1z"/>
    <path fill="#B22234" d="M0 2h24v2H0zm0 4h24v2H0zm0 4h24v2H0zm0 4h24v2H0z"/>
    <path fill="#FFF" d="M0 0h24v2H0zm0 4h24v2H0zm12 4h12v2H12zm0 4h12v2H12z"/>
  </svg>
);

const EgyptFlag = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="18" viewBox="0 0 9 6" className="rounded-sm">
    <path fill="#C8102E" d="M0 0h9v2H0z"/>
    <path fill="#FFF" d="M0 2h9v2H0z"/>
    <path d="M0 4h9v2H0z"/>
    <path fill="#CDBA00" d="M4.5 2.5c.2 0 .4.2.4.4v.2h-.8v-.2c0-.2.2-.4.4-.4zm0 .2c.1 0 .2.1.2.2v.1h-.4v-.1c0-.1.1-.2.2-.2zM4.1 3.3h.8v.2h-.8z"/>
  </svg>
);

const LanguageSwitcher = ({ language, setLanguage }: { language: 'ar' | 'en', setLanguage: (lang: 'ar' | 'en') => void }) => {
    const handleLanguageChange = (newLang: 'ar' | 'en') => {
        setLanguage(newLang);
        localStorage.setItem('language', newLang);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2">
                    <Languages className="h-5 w-5" />
                    <span className="uppercase font-bold">{language}</span>
                    <ChevronDown className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleLanguageChange('en')} className="gap-2 cursor-pointer">
                    <USFlag />
                    <span>English</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLanguageChange('ar')} className="gap-2 cursor-pointer">
                    <EgyptFlag />
                    <span>العربية</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
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

  useEffect(() => {
    const savedLang = localStorage.getItem('language');
    if (savedLang === 'en' || savedLang === 'ar') {
        setLanguage(savedLang);
    }
  }, []);

  useEffect(() => {
      document.documentElement.lang = language;
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const fetchPrayerTimesFromCoords = useCallback(async (latitude: number, longitude: number) => {
    setAppState('loading');
    setError(null);
  
    try {
      const geoResponse = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
      if (!geoResponse.ok) throw new Error('Failed to use reverse geocoding service.');
      
      const geoData = await geoResponse.json();
      const city = geoData.city || geoData.locality;
      const countryCode = geoData.countryCode;
      const countryData = countries.find(c => c.code === countryCode);

      if (!countryData || !city) {
        setAppState('geo-fallback');
        setError("Your detected country is not supported or city could not be determined.");
        return;
      }
      
      const method = countryData.method;
      const today = new Date();
      const dateString = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
      
      const url = `https://api.aladhan.com/v1/timings/${dateString}?latitude=${latitude}&longitude=${longitude}&method=${method}`;
  
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch prayer times. Please check your internet connection.');
      const data: AladhanResponse = await response.json();
      if (data.code !== 200) throw new Error(data.status || 'An unknown error occurred.');
      
      setPrayerData(data.data);
      const countryDisplayName = language === 'ar' ? countryData.arabicName : countryData.name;
      setDisplayLocation(`${city}, ${countryDisplayName}`);
      setSelectedCountry(countryData.name);
      setSelectedCity(city);
      setAvailableCities(countryData.cities);
      setAppState('ready');
  
    } catch (e: any) {
      setError(e.message);
      setAppState('geo-fallback');
      toast({ variant: "destructive", title: t.notificationError, description: e.message });
    }
  }, [toast, t.notificationError, language]);

  const fetchPrayerTimesByCity = useCallback(async (city: string, countryName: string) => {
    setAppState('loading');
    setError(null);

    try {
        const countryData = countries.find(c => c.name === countryName);
        if (!countryData) throw new Error("Invalid country selected.");

        const cityData = countryData.cities.find(c => c.name.toLowerCase() === city.toLowerCase());
        const cityForApi = cityData ? cityData.arabicName : city;

        const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityForApi)},${encodeURIComponent(countryData.name)}`;
        
        const nominatimRes = await fetch(nominatimUrl, { headers: { 'User-Agent': 'PrayerPal/1.0' } });
        if (!nominatimRes.ok) throw new Error('Failed to use location to coordinate service.');
        
        const nominatimData = await nominatimRes.json();
        if (nominatimData.length === 0) {
            throw new Error(`Could not find coordinates for ${city}.`);
        }
        
        const { lat, lon } = nominatimData[0];
        await fetchPrayerTimesFromCoords(parseFloat(lat), parseFloat(lon));
        setIsLocationModalOpen(false);

    } catch (e: any) {
        setError(e.message);
        setAppState('geo-fallback');
        toast({ variant: "destructive", title: t.notificationError, description: e.message });
    }
  }, [toast, fetchPrayerTimesFromCoords, t.notificationError]);

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
    return getPrayerList(prayerData.timings, new Date(parseInt(prayerData.date.timestamp) * 1000), language);
  }, [prayerData, language]);
  
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

  const handleCountryChange = useCallback((countryIdentifier: string) => {
    const countryData = countries.find(c => c.name.toLowerCase() === countryIdentifier.toLowerCase() || c.arabicName === countryIdentifier);
    if (countryData) {
        setSelectedCountry(countryData.name);
        setAvailableCities(countryData.cities);
        setSelectedCity('');
    }
  }, []);
  
  const handleCityChange = useCallback((cityName: string) => {
      setSelectedCity(cityName);
  }, []);

  const handleManualLocationSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCity && selectedCountry) {
      const countryData = countries.find(c => c.name === selectedCountry);
      const cityData = countryData?.cities.find(c => c.name === selectedCity);
      // Use the Arabic name for the API call as it's more reliable with AlAdhan
      const cityForApi = cityData ? cityData.arabicName : selectedCity;
      fetchPrayerTimesByCity(cityForApi, selectedCountry);
    }
  }, [selectedCity, selectedCountry, fetchPrayerTimesByCity]);

  const handleNotificationToggle = async (checked: boolean) => {
    if (!checked) return;

    if (!('Notification' in window)) {
        toast({ variant: "destructive", title: t.notificationNotSupported, description: t.notificationNotSupportedDesc });
        return;
    }

    if (notificationStatus === 'granted') {
        setNotificationsEnabled(true);
        toast({ title: t.notificationEnabled, description: t.notificationEnabledDesc });
        return;
    }

    if (notificationStatus === 'denied') {
        toast({ variant: "destructive", title: t.notificationBlocked, description: t.notificationBlockedDesc });
        return;
    }

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
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!prayerData) {
    return null; // Should not happen if states are managed correctly
  }

  const { date } = prayerData;
  const gregorianDate = language === 'ar' ? `${date.gregorian.weekday.ar}, ${date.readable}` : `${date.gregorian.weekday.en}, ${date.readable}`;
  const hijriDate = language === 'ar' ? `${date.hijri.weekday.ar}, ${date.hijri.day} ${date.hijri.month.ar} ${date.hijri.year} هـ` : `${date.hijri.weekday.en}, ${date.hijri.day} ${date.hijri.month.en} ${date.hijri.year} AH`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary">{t.title}</h1>
        <div className='flex items-center gap-2'>
            <LanguageSwitcher language={language} setLanguage={setLanguage} />
            <ThemeSwitcher />
        </div>
      </header>

      <main className="container mx-auto px-4 pb-8">
        
        <section className="text-center mb-8">
          <p className="text-lg text-muted-foreground">{gregorianDate}</p>
          <p className="text-xl text-accent font-semibold">{hijriDate}</p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <MapPin className="w-5 h-5 text-muted-foreground" />
            <span className="text-lg text-foreground">{displayLocation}</span>
            <Dialog open={isLocationModalOpen} onOpenChange={setIsLocationModalOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Pencil className="w-4 h-4" />
                  <span className="sr-only">{t.changeLocation}</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{t.changeLocation}</DialogTitle>
                </DialogHeader>
                <div className="pt-4">
                  <LocationForm 
                    selectedCountry={selectedCountry}
                    selectedCity={selectedCity}
                    availableCities={availableCities}
                    loading={appState === 'loading'}
                    handleCountryChange={handleCountryChange}
                    handleCityChange={handleCityChange}
                    handleManualLocationSubmit={handleManualLocationSubmit}
                    language={language}
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </section>

        {nextPrayer && (
          <section className="mb-10">
            <Card className="w-full max-w-2xl mx-auto bg-card border-primary/20 shadow-2xl shadow-primary/10">
              <CardHeader className="text-center pb-2">
                <p className="text-lg text-primary font-semibold">{t.nextPrayer}</p>
                <CardTitle className="font-bold text-5xl text-foreground">{nextPrayer.displayName}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="font-mono text-6xl md:text-7xl font-bold text-primary tracking-tight">{countdown}</p>
                <p className="text-2xl text-muted-foreground">{nextPrayer.time}</p>
              </CardContent>
            </Card>
          </section>
        )}

        <section className="mb-10">
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {prayerTimesToDisplay.map((prayer) => (
                <Card key={prayer.name} className={cn(
                  'text-center transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-1',
                  prayer.name === nextPrayer?.name ? 'bg-primary/10 border-accent ring-2 ring-accent' : 'bg-card'
                  )}>
                  <CardHeader className="pb-2 pt-4">
                    <CardTitle className="text-xl font-medium">{prayer.displayName}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold font-mono">{prayer.time}</div>
                  </CardContent>
                </Card>
              ))}
           </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-md">
            <CardHeader>
                <CardTitle className="font-bold">{t.prayerNotifications}</CardTitle>
                <CardDescription>{t.notificationDesc}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <Label htmlFor="notifications" className="flex items-center gap-3 cursor-pointer">
                        <Bell className="w-6 h-6 text-accent"/>
                        <span className="text-lg font-semibold">{t.enableNotifications}</span>
                    </Label>
                    <Switch 
                      id="notifications" 
                      checked={notificationsEnabled} 
                      onCheckedChange={handleNotificationToggle}
                      disabled={notificationStatus === 'granted' || notificationStatus === 'denied'}
                      aria-label="Enable prayer notifications" 
                    />
                </div>
            </CardContent>
          </Card>
          <Card className="shadow-md">
            <CardHeader>
                <CardTitle className="font-bold">{t.calculationInfo}</CardTitle>
                <CardDescription>{t.calculationMethodDesc}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-lg">
                <span className="font-semibold">{t.method}: </span> 
                {prayerData.meta.method.name}
              </p>
            </CardContent>
          </Card>
        </section>

      </main>
      <footer className="text-center py-6 border-t mt-8">
        <p className="text-sm text-muted-foreground">
            {t.apiCredit} <a href="https://aladhan.com/prayer-times-api" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Aladhan API</a>
        </p>
      </footer>
    </div>
  );
}
