
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import type { AladhanResponse, PrayerData } from '@/types/prayer';
import { getPrayerList, findNextPrayer, formatCountdown, type Prayer } from '@/lib/time';
import { countries } from '@/lib/locations';
import { Sunrise, Sun, Sunset, Moon, MapPin, Bell, Loader2, Pencil } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const prayerIcons: { [key: string]: React.ReactNode } = {
  Fajr: <Sunrise className="w-8 h-8 text-accent" />,
  Sunrise: <Sunrise className="w-8 h-8 text-accent" />,
  Dhuhr: <Sun className="w-8 h-8 text-accent" />,
  Asr: <Sun className="w-8 h-8 text-accent" />,
  Maghrib: <Sunset className="w-8 h-8 text-accent" />,
  Isha: <Moon className="w-8 h-8 text-accent" />,
};

export default function Home() {
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [prayerData, setPrayerData] = useState<PrayerData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  const [displayLocation, setDisplayLocation] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const { toast } = useToast();
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const fetchPrayerTimes = useCallback(async (source: { lat: number; lon: number } | { city: string; country: string }) => {
    setLoading(true);
    setError(null);
    let url = '';
    if ('city' in source) {
      url = `https://api.aladhan.com/v1/timingsByCity?city=${source.city}&country=${source.country}&method=2`;
    } else {
      url = `https://api.aladhan.com/v1/timings?latitude=${source.lat}&longitude=${source.lon}&method=2`;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch prayer times. Please check the city and country names.');
      const data: AladhanResponse = await response.json();
      if (data.code !== 200) throw new Error(data.status || 'An unknown error occurred.');
      setPrayerData(data.data);
      if ('city' in source) {
        setDisplayLocation(`${source.city}, ${source.country}`);
      } else {
        const timezone = data.data.meta.timezone;
        const locationString = timezone.replace(/_/g, ' ').split('/').pop();
        setDisplayLocation(locationString || timezone);
      }
    } catch (e: any) {
      setError(e.message);
      toast({
        variant: "destructive",
        title: "Error",
        description: e.message,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lon: longitude });
          fetchPrayerTimes({ lat: latitude, lon: longitude });
        },
        () => {
          setError('Location permission denied. Please enter your location manually.');
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser. Please enter your location manually.');
      setLoading(false);
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
      nextPrayer: next,
      countdown: formatCountdown(diff),
    };
  }, [prayerList, currentTime]);
  
  const prayerTimesToDisplay = useMemo(() => {
    return prayerList.filter(p => p.name !== 'Sunrise' && p.name !== 'Sunset');
  }, [prayerList]);

  const handleCountryChange = (countryName: string) => {
    setSelectedCountry(countryName);
    const countryData = countries.find(c => c.name === countryName);
    setAvailableCities(countryData ? countryData.cities : []);
    setSelectedCity('');
  };

  const handleManualLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCity && selectedCountry) {
      fetchPrayerTimes({ city: selectedCity, country: selectedCountry });
      setSelectedCountry('');
      setSelectedCity('');
      setAvailableCities([]);
      if(isLocationModalOpen) setIsLocationModalOpen(false);
    }
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled) {
      if (!('Notification' in window)) {
        toast({ variant: "destructive", title: "Unsupported", description: "This browser does not support desktop notification." });
        return;
      }
      if (Notification.permission === 'granted') {
        setNotificationsEnabled(true);
        toast({ title: "Success", description: "Notifications are already enabled." });
      } else if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setNotificationsEnabled(true);
          toast({ title: "Success", description: "Notifications have been enabled!" });
        } else {
          toast({ variant: "destructive", title: "Info", description: "Notification permission was denied." });
        }
      } else {
        toast({ variant: "destructive", title: "Blocked", description: "Notifications are blocked. Please enable them in your browser settings." });
      }
    } else {
      setNotificationsEnabled(false);
    }
  };
  
  const LocationForm = ({ inModal = false }: { inModal?: boolean }) => (
     <form onSubmit={handleManualLocationSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`country-${inModal ? 'modal' : 'form'}`}>Country</Label>
          <Select onValueChange={handleCountryChange} value={selectedCountry}>
            <SelectTrigger id={`country-${inModal ? 'modal' : 'form'}`}>
              <SelectValue placeholder="Select a country" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country.name} value={country.name}>{country.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`city-${inModal ? 'modal' : 'form'}`}>City</Label>
          <Select onValueChange={setSelectedCity} value={selectedCity} disabled={!selectedCountry}>
            <SelectTrigger id={`city-${inModal ? 'modal' : 'form'}`}>
              <SelectValue placeholder="Select a city" />
            </SelectTrigger>
            <SelectContent>
              {availableCities.map((city) => (
                <SelectItem key={city} value={city}>{city}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" className="w-full" disabled={loading || !selectedCity || !selectedCountry}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
          Get Prayer Times
        </Button>
      </form>
  );

  if (loading && !prayerData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
        <Loader2 className="w-16 h-16 animate-spin text-primary" />
        <p className="mt-4 text-lg font-semibold font-headline">Fetching your location and prayer times...</p>
      </div>
    );
  }

  if (error && !prayerData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="w-full max-w-md mx-4 p-4 shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-center text-2xl">Location Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground mb-4">{error}</p>
            <LocationForm />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!prayerData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
        <p className="mt-4 text-lg font-semibold font-headline">Something went wrong. Please refresh the page.</p>
      </div>
    );
  }

  const { date } = prayerData;

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
      <main className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary mb-2">Prayer Pal</h1>
          <p className="text-lg text-muted-foreground">{date.gregorian.weekday.en}, {date.gregorian.readable}</p>
          <p className="text-md text-accent font-semibold">{date.hijri.weekday.en}, {date.hijri.day} {date.hijri.month.en} {date.hijri.year} AH</p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <MapPin className="w-5 h-5 text-muted-foreground" />
            <span className="text-lg text-foreground">{displayLocation}</span>
            <Dialog open={isLocationModalOpen} onOpenChange={setIsLocationModalOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Pencil className="w-4 h-4" />
                  <span className="sr-only">Change location</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Change Location</DialogTitle>
                  <DialogDescription>
                    Choose a country and city to get prayer times for a different location.
                  </DialogDescription>
                </DialogHeader>
                <div className="pt-4">
                  <LocationForm inModal={true} />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {nextPrayer && (
          <section className="mb-12">
            <Card className="w-full max-w-2xl mx-auto bg-card border-primary/50 shadow-2xl shadow-primary/20">
              <CardHeader className="text-center pb-2">
                <p className="text-lg text-primary font-semibold font-headline">Next Prayer</p>
                <CardTitle className="font-headline text-5xl text-primary">{nextPrayer.name}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="font-mono text-6xl md:text-7xl font-bold text-foreground tracking-tight">{countdown}</p>
                <p className="text-2xl text-muted-foreground">until {nextPrayer.time}</p>
              </CardContent>
            </Card>
          </section>
        )}

        <section className="mb-12">
           <h2 className="text-3xl font-headline text-center mb-6">Today's Prayer Times</h2>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {prayerTimesToDisplay.map((prayer) => (
                <Card key={prayer.name} className={`bg-card transition-all duration-300 shadow-md hover:shadow-lg ${prayer.name === nextPrayer?.name ? 'border-accent ring-2 ring-accent' : ''}`}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-medium font-headline">{prayer.name}</CardTitle>
                    {prayerIcons[prayer.name]}
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold font-mono">{prayer.time}</div>
                  </CardContent>
                </Card>
              ))}
           </div>
        </section>

        <section className="flex justify-center">
          <Card className="w-full max-w-md shadow-md">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                 <Bell className="w-6 h-6 text-accent"/>
                 <div>
                    <Label htmlFor="notifications" className="text-lg font-semibold font-headline">Prayer Notifications</Label>
                    <p className="text-sm text-muted-foreground">Get notified for prayers.</p>
                 </div>
              </div>
              <Switch id="notifications" checked={notificationsEnabled} onCheckedChange={handleNotificationToggle} aria-label="Toggle prayer notifications" />
            </CardContent>
          </Card>
        </section>

      </main>
      <footer className="text-center py-4 border-t mt-8">
        <p className="text-sm text-muted-foreground">
            Prayer times provided by <a href="https://aladhan.com/prayer-times-api" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Aladhan API</a>.
        </p>
      </footer>
    </div>
  );
}
