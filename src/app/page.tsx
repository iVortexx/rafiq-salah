
'use client';

import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import type { AladhanResponse, PrayerData } from '@/types/prayer';
import { getPrayerList, findNextPrayer, formatCountdown, type Prayer } from '@/lib/time';
import { countries, type Country, type City } from '@/lib/locations';
import { Sunrise, Sun, Sunset, Moon, MapPin, Bell, Loader2, Pencil, Check, ChevronsUpDown, MoonIcon, SunIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

const prayerIcons: { [key: string]: React.ReactNode } = {
  Fajr: <Sunrise className="w-8 h-8 text-accent" />,
  Sunrise: <Sunrise className="w-8 h-8 text-accent" />,
  Dhuhr: <Sun className="w-8 h-8 text-accent" />,
  Asr: <Sun className="w-8 h-8 text-accent" />,
  Maghrib: <Sunset className="w-8 h-8 text-accent" />,
  Sunset: <Sunset className="w-8 h-8 text-accent" />,
  Isha: <Moon className="w-8 h-8 text-accent" />,
};

interface LocationFormProps {
  selectedCountry: string;
  selectedCity: string;
  availableCities: City[];
  loading: boolean;
  handleCountryChange: (countryName: string) => void;
  handleCityChange: (cityName: string) => void;
  handleManualLocationSubmit: (e: React.FormEvent) => void;
}

const LocationForm = memo(({
  selectedCountry,
  selectedCity,
  availableCities,
  loading,
  handleCountryChange,
  handleCityChange,
  handleManualLocationSubmit
}: LocationFormProps) => {
  const [countryOpen, setCountryOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);

  const selectedCountryData = useMemo(() => countries.find(c => c.name === selectedCountry), [selectedCountry]);

  return (
   <form onSubmit={handleManualLocationSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>الدولة</Label>
        <Popover open={countryOpen} onOpenChange={setCountryOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" aria-expanded={countryOpen} className="w-full justify-between text-base md:text-sm">
              {selectedCountryData ? selectedCountryData.arabicName : "اختر دولة"}
              <ChevronsUpDown className="ms-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
            <Command>
              <CommandInput placeholder="ابحث عن دولة..." />
              <CommandList>
                <CommandEmpty>لم يتم العثور على الدولة.</CommandEmpty>
                <CommandGroup>
                  {countries.map((country) => (
                    <CommandItem
                      key={country.name}
                      value={country.name}
                      onSelect={(currentValue) => {
                         handleCountryChange(countries.find(c => c.name.toLowerCase() === currentValue.toLowerCase())?.name || '');
                         setCountryOpen(false);
                      }}
                    >
                      <Check className={cn("me-2 h-4 w-4", selectedCountry.toLowerCase() === country.name.toLowerCase() ? "opacity-100" : "opacity-0")} />
                      {country.arabicName}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      <div className="space-y-2">
        <Label>المدينة</Label>
        <Popover open={cityOpen} onOpenChange={setCityOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" aria-expanded={cityOpen} className="w-full justify-between text-base md:text-sm" disabled={!selectedCountry}>
              {selectedCity || "اختر مدينة"}
              <ChevronsUpDown className="ms-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
             <Command>
              <CommandInput placeholder="ابحث عن مدينة..." />
              <CommandList>
                <CommandEmpty>لم يتم العثور على مدينة.</CommandEmpty>
                <CommandGroup>
                  {availableCities.map((city) => (
                    <CommandItem
                      key={city.name}
                      value={city.name}
                      onSelect={(currentValue) => {
                        handleCityChange(availableCities.find(c => c.name.toLowerCase() === currentValue.toLowerCase())?.name || '');
                        setCityOpen(false);
                      }}
                    >
                      <Check className={cn("me-2 h-4 w-4", selectedCity.toLowerCase() === city.name.toLowerCase() ? "opacity-100" : "opacity-0")} />
                      {city.arabicName}
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
        الحصول على أوقات الصلاة
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


export default function Home() {
  const [prayerData, setPrayerData] = useState<PrayerData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(true);
  
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [availableCities, setAvailableCities] = useState<City[]>([]);

  const [displayLocation, setDisplayLocation] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const { toast } = useToast();
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const fetchPrayerTimes = useCallback(async (city: string, countryName: string) => {
    setLoading(true);
    setError(null);
    setGeoLoading(true);

    const countryData = countries.find(c => c.name === countryName);
    if (!countryData) {
        const msg = 'الدولة المختارة غير مدعومة في هذا التطبيق.';
        setError(msg);
        toast({ variant: "destructive", title: "الموقع غير مدعوم", description: msg });
        setLoading(false);
        setGeoLoading(false);
        return;
    }

    const method = countryData.method;
    const today = new Date();
    const dateString = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
    
    const url = `https://api.aladhan.com/v1/timingsByCity/${dateString}?city=${encodeURIComponent(city)}&country=${encodeURIComponent(countryName)}&method=${method}`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('فشل جلب أوقات الصلاة. يرجى التحقق من اسم المدينة والدولة.');
      const data: AladhanResponse = await response.json();
      if (data.code !== 200) throw new Error(data.status || 'حدث خطأ غير معروف.');
      
      const cityData = countryData.cities.find(c => c.arabicName === city);
      
      setPrayerData(data.data);
      setDisplayLocation(`${cityData?.arabicName || city}, ${countryData.arabicName}`);
      setSelectedCountry(countryData.name);
      setSelectedCity(city);
      setAvailableCities(countryData.cities);

    } catch (e: any) {
      setError(e.message);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: e.message,
      });
    } finally {
      setLoading(false);
      setGeoLoading(false);
      setIsLocationModalOpen(false);
    }
  }, [toast]);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const geoResponse = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=ar`);
          if (!geoResponse.ok) {
            throw new Error('فشلت خدمة تحديد الموقع الجغرافي العكسي.');
          }
          const geoData = await geoResponse.json();
          
          const countryCode = geoData.countryCode;
          const city = geoData.city || geoData.locality;

          const detectedCountry = countries.find(c => c.code === countryCode);

          if (detectedCountry && city) {
             await fetchPrayerTimes(city, detectedCountry.name);
          } else {
             const errorMsg = detectedCountry 
                ? "تعذر تحديد المدينة من إحداثياتك." 
                : "بلدك الذي تم اكتشافه غير مدعوم من قبل هذا التطبيق.";
             setError(errorMsg);
             setGeoLoading(false);
          }
        } catch (error: any) {
          console.error("Geolocation or fetch process failed:", error);
          toast({ title: "لم نتمكن من تحديد موقعك تلقائيًا", description: error.message || "يرجى تحديد موقعك يدويًا.", variant: "destructive" });
          setGeoLoading(false);
        }
      }, (error) => {
        console.error("Geolocation permission failed:", error.message);
        toast({ title: "تم رفض الوصول إلى الموقع", description: "يرجى تحديد موقعك يدويًا.", variant: "destructive" });
        setGeoLoading(false);
      });
    } else {
      toast({ title: "تحديد الموقع الجغرافي غير مدعوم", description: "يرجى تحديد موقعك يدويًا." });
      setGeoLoading(false);
    }
  }, [fetchPrayerTimes, toast]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const prayerList = useMemo(() => {
    if (!prayerData) return [];
    return getPrayerList(prayerData.timings, new Date(parseInt(prayerData.date.timestamp) * 1000));
  }, [prayerData]);

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

  const handleCountryChange = useCallback((countryName: string) => {
    setSelectedCountry(countryName);
    const countryData = countries.find(c => c.name === countryName);
    setAvailableCities(countryData ? countryData.cities : []);
    setSelectedCity('');
  }, []);
  
  const handleCityChange = useCallback((cityName: string) => {
      setSelectedCity(cityName);
  }, []);

  const handleManualLocationSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCity && selectedCountry) {
      fetchPrayerTimes(selectedCity, selectedCountry);
    }
  }, [selectedCity, selectedCountry, fetchPrayerTimes]);

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled) {
      if (!('Notification' in window)) {
        toast({ variant: "destructive", title: "غير مدعوم", description: "هذا المتصفح لا يدعم إشعارات سطح المكتب." });
        return;
      }
      if (Notification.permission === 'granted') {
        setNotificationsEnabled(true);
        toast({ title: "نجاح", description: "الإشعارات مفعلة بالفعل." });
      } else if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setNotificationsEnabled(true);
          toast({ title: "نجاح", description: "تم تفعيل الإشعارات!" });
        } else {
          toast({ variant: "destructive", title: "معلومات", description: "تم رفض إذن الإشعارات." });
        }
      } else {
        toast({ variant: "destructive", title: "محظور", description: "الإشعارات محظورة. يرجى تفعيلها في إعدادات المتصفح." });
      }
    } else {
      setNotificationsEnabled(false);
    }
  };
  
  if (geoLoading) {
    return (
       <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
        <Loader2 className="w-16 h-16 animate-spin text-primary" />
        <p className="mt-4 text-lg font-semibold font-headline">جاري تحديد موقعك...</p>
      </div>
    );
  }

  if (!prayerData && !loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
        <Card className="w-full max-w-md mx-4 p-4 shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-center text-3xl text-primary">أهلاً بك في رفيق الصلاة</CardTitle>
            <CardDescription className="text-center text-muted-foreground pt-2">
              {error ? error : "الرجاء تحديد موقعك لعرض أوقات الصلاة."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LocationForm 
              selectedCountry={selectedCountry}
              selectedCity={selectedCity}
              availableCities={availableCities}
              loading={loading}
              handleCountryChange={handleCountryChange}
              handleCityChange={handleCityChange}
              handleManualLocationSubmit={handleManualLocationSubmit}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading && !prayerData) {
    return (
       <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
        <Loader2 className="w-16 h-16 animate-spin text-primary" />
        <p className="mt-4 text-lg font-semibold font-headline">جاري جلب أوقات الصلاة...</p>
      </div>
    );
  }

  if (!prayerData) {
    return null; // Should be handled by the loading/error states above
  }

  const { date } = prayerData;

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
      <header className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold font-headline text-primary">رفيق الصلاة</h1>
        <ThemeSwitcher />
      </header>

      <main className="container mx-auto px-4 pb-8">
        
        <section className="text-center mb-8">
          <p className="text-lg text-muted-foreground">{date.gregorian.weekday.en}, {date.gregorian.readable}</p>
          <p className="text-xl text-accent font-semibold">{date.hijri.weekday.ar}, {date.hijri.day} {date.hijri.month.ar} {date.hijri.year} هـ</p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <MapPin className="w-5 h-5 text-muted-foreground" />
            <span className="text-lg text-foreground">{displayLocation}</span>
            <Dialog open={isLocationModalOpen} onOpenChange={setIsLocationModalOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Pencil className="w-4 h-4" />
                  <span className="sr-only">تغيير الموقع</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>تغيير الموقع</DialogTitle>
                </DialogHeader>
                <div className="pt-4">
                  <LocationForm 
                    selectedCountry={selectedCountry}
                    selectedCity={selectedCity}
                    availableCities={availableCities}
                    loading={loading}
                    handleCountryChange={handleCountryChange}
                    handleCityChange={handleCityChange}
                    handleManualLocationSubmit={handleManualLocationSubmit}
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
                <p className="text-lg text-primary font-semibold font-headline">الصلاة القادمة</p>
                <CardTitle className="font-headline text-5xl text-foreground">{nextPrayer.arabicName}</CardTitle>
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
                    <CardTitle className="text-xl font-medium font-headline">{prayer.arabicName}</CardTitle>
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
                <CardTitle className="font-headline">إشعارات الصلاة</CardTitle>
                <CardDescription>تلقي إشعارات لأوقات الصلاة.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="flex items-center space-x-3 space-x-reverse">
                 <Bell className="w-6 h-6 text-accent"/>
                 <Label htmlFor="notifications" className="text-lg font-semibold">تفعيل الإشعارات</Label>
              </div>
              <Switch id="notifications" checked={notificationsEnabled} onCheckedChange={handleNotificationToggle} aria-label="تفعيل أو تعطيل إشعارات الصلاة" />
            </CardContent>
          </Card>
          <Card className="shadow-md">
            <CardHeader>
                <CardTitle className="font-headline">معلومات الحساب</CardTitle>
                <CardDescription>طريقة حساب أوقات الصلاة المستخدمة.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-lg">
                <span className="font-semibold">الطريقة: </span>
                {prayerData.meta.method.name}
              </p>
            </CardContent>
          </Card>
        </section>

      </main>
      <footer className="text-center py-6 border-t mt-8">
        <p className="text-sm text-muted-foreground">
            أوقات الصلاة مقدمة من <a href="https://aladhan.com/prayer-times-api" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Aladhan API</a>
        </p>
      </footer>
    </div>
  );
}
