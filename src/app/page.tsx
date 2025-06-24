
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
import { Sunrise, Sun, Sunset, Moon, MapPin, Bell, Loader2, Pencil, Check, ChevronsUpDown } from 'lucide-react';
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
  inModal?: boolean;
  selectedCountry: string;
  selectedCity: string;
  availableCities: City[];
  loading: boolean;
  handleCountryChange: (countryName: string) => void;
  handleCityChange: (cityName: string) => void;
  handleManualLocationSubmit: (e: React.FormEvent) => void;
}

const LocationForm = memo(({
  inModal = false,
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
  const selectedCityData = useMemo(() => availableCities.find(c => c.name === selectedCity), [selectedCity, availableCities]);

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
              {selectedCityData ? selectedCityData.arabicName : "اختر مدينة"}
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
             throw new Error(errorMsg);
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
  }, [fetchPrayerTimes]);

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
    return prayerList.filter(p => p.name !== 'Sunrise');
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
              الرجاء تحديد موقعك لعرض أوقات الصلاة.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && <p className="text-center text-destructive mb-4">{error}</p>}
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
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
        <p className="mt-4 text-lg font-semibold font-headline">تعذر تحميل أوقات الصلاة. يرجى تحديث الصفحة والمحاولة مرة أخرى.</p>
      </div>
    );
  }

  const { date } = prayerData;

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
      <main className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary mb-2">رفيق الصلاة</h1>
          <p className="text-lg text-muted-foreground">{date.gregorian.weekday.en}, {date.gregorian.readable}</p>
          <p className="text-md text-accent font-semibold">{date.hijri.weekday.ar}, {date.hijri.day} {date.hijri.month.ar} {date.hijri.year} هـ</p>
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
                    inModal={true}
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
        </header>

        {nextPrayer && (
          <section className="mb-12">
            <Card className="w-full max-w-2xl mx-auto bg-card border-primary/50 shadow-2xl shadow-primary/20">
              <CardHeader className="text-center pb-2">
                <p className="text-lg text-primary font-semibold font-headline">الصلاة التالية</p>
                <CardTitle className="font-headline text-5xl text-primary">{nextPrayer.arabicName}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="font-mono text-6xl md:text-7xl font-bold text-foreground tracking-tight">{countdown}</p>
                <p className="text-2xl text-muted-foreground">حتى {nextPrayer.time}</p>
              </CardContent>
            </Card>
          </section>
        )}

        <section className="mb-12">
           <h2 className="text-3xl font-headline text-center mb-6">أوقات صلاة اليوم</h2>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
              {prayerTimesToDisplay.map((prayer) => (
                <Card key={prayer.name} className={`bg-card transition-all duration-300 shadow-md hover:shadow-lg ${prayer.name === nextPrayer?.name ? 'border-accent ring-2 ring-accent' : ''}`}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-medium font-headline">{prayer.arabicName}</CardTitle>
                    {prayerIcons[prayer.name]}
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold font-mono text-end">{prayer.time}</div>
                  </CardContent>
                </Card>
              ))}
           </div>
        </section>

        <section className="flex justify-center">
          <Card className="w-full max-w-md shadow-md">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center space-x-3 space-x-reverse">
                 <Bell className="w-6 h-6 text-accent"/>
                 <div>
                    <Label htmlFor="notifications" className="text-lg font-semibold font-headline">إشعارات الصلاة</Label>
                    <p className="text-sm text-muted-foreground">تلقي إشعارات لأوقات الصلاة.</p>
                 </div>
              </div>
              <Switch id="notifications" checked={notificationsEnabled} onCheckedChange={handleNotificationToggle} aria-label="تفعيل أو تعطيل إشعارات الصلاة" />
            </CardContent>
          </Card>
        </section>

      </main>
      <footer className="text-center py-4 border-t mt-8">
        {prayerData && (
          <p className="text-sm text-muted-foreground mb-2">
              طريقة الحساب: {prayerData.meta.method.name}
          </p>
        )}
        <p className="text-sm text-muted-foreground">
            أوقات الصلاة مقدمة من <a href="https://aladhan.com/prayer-times-api" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Aladhan API</a>.
        </p>
      </footer>
    </div>
  );
}
