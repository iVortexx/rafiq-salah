'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import type { AladhanResponse, PrayerData } from '@/types/prayer';
import type { City } from '@/lib/locations';
import { countries } from '@/lib/locations';
import { useLocalStorage } from '@/hooks/use-local-storage';

type AppState = 'loading' | 'ready' | 'error' | 'geo-fallback';

export function usePrayerTimes(language: 'ar' | 'en', t: any, settings?: any) {
  const [appState, setAppState] = useState<AppState>('loading');
  const [prayerData, setPrayerData] = useState<PrayerData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [availableCities, setAvailableCities] = useState<City[]>([]);

  const [displayLocation, setDisplayLocation] = useState('');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const { toast } = useToast();
  const geoAttempted = useRef(false);
  const [savedLocation, setSavedLocation, hydrated] = useLocalStorage<{country: string, city: string} | null>('location', null);

  // Map calculation method string to Aladhan API method number
  const methodMap: Record<string, number> = {
    mwl: 3, // Muslim World League
    isna: 2, // Islamic Society of North America
    egypt: 5, // Egyptian General Authority of Survey
    makkah: 4, // Umm Al-Qura University, Makkah
    karachi: 1, // University of Islamic Sciences, Karachi
    tehran: 7, // Institute of Geophysics, University of Tehran
    jafari: 8, // Shia Ithna-Ashari, Leva Institute, Qum
  };

  // Helper to get canonical (English) names
  function getCanonicalCountryName(name: string): string {
    const country = countries.find(c => c.name === name || c.arabicName === name);
    return country ? country.name : name;
  }
  function getCanonicalCityName(countryName: string, cityName: string): string {
    const country = countries.find(c => c.name === countryName || c.arabicName === countryName);
    if (!country) return cityName;
    const city = country.cities.find(c => c.name === cityName || c.arabicName === cityName);
    return city ? city.name : cityName;
  }

  const fetchPrayerTimesByCity = useCallback(async (cityIdentifier: string, countryIdentifier: string) => {
    setAppState('loading');
    setError(null);
  
    try {
      // Always use canonical (English) names for lookup
      const canonicalCountry = getCanonicalCountryName(countryIdentifier);
      const canonicalCity = getCanonicalCityName(canonicalCountry, cityIdentifier);
      const countryData = countries.find(c => c.name === canonicalCountry);
      if (!countryData) throw new Error("Invalid country selected.");
  
      const cityData = countryData.cities.find(c => c.name === canonicalCity);
      if (!cityData) throw new Error("Invalid city selected.");
      // Use settings for method, juristic, high latitude, daylight saving, and prayer adjustments
      let method = countryData.method;
      if (settings?.calculationMethod && methodMap[settings.calculationMethod]) {
        method = methodMap[settings.calculationMethod];
      }
      const school = settings?.juristicMethod === 'hanafi' ? 1 : 0;
      let latitudeAdjustmentMethod = 'NONE';
      if (settings?.highLatitudeAdjustment === 'midnight') latitudeAdjustmentMethod = 'MIDNIGHT';
      else if (settings?.highLatitudeAdjustment === 'oneseventh') latitudeAdjustmentMethod = 'ONE_SEVENTH';
      else if (settings?.highLatitudeAdjustment === 'anglebased') latitudeAdjustmentMethod = 'ANGLE_BASED';
      const dst = settings?.daylightSaving === '+1' ? 1 : settings?.daylightSaving === '-1' ? -1 : 0;
      // Prayer adjustments: order is Imsak,Fajr,Sunrise,Dhuhr,Asr,Maghrib,Sunset,Isha,Midnight
      // We'll only adjust Fajr, Dhuhr, Asr, Maghrib, Isha, rest 0
      const pa = settings?.prayerAdjustments || {};
      const tune = [0, pa.fajr || 0, 0, pa.dhuhr || 0, pa.asr || 0, pa.maghrib || 0, 0, pa.isha || 0, 0].join(',');
      const today = new Date();
      const dateString = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
  
      // The API needs the Arabic city and country name to function correctly
      let url = `https://api.aladhan.com/v1/timingsByCity/${dateString}?city=${cityData.arabicName}&country=${countryData.arabicName}&method=${method}`;
      url += `&school=${school}`;
      url += `&latitudeAdjustmentMethod=${latitudeAdjustmentMethod}`;
      url += `&dst=${dst}`;
      url += `&tune=${tune}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch prayer times. Please check your internet connection.');
      const data: AladhanResponse = await response.json();
      if (data.code !== 200) throw new Error(data.status || 'An unknown error occurred.');
      
      setPrayerData(data.data);
      
      // For display, use display names
      const countryDisplayName = language === 'ar' ? countryData.arabicName : countryData.name;
      const cityDisplayName = language === 'ar' ? cityData.arabicName : cityData.name;
      setDisplayLocation(`${cityDisplayName}, ${countryDisplayName}`);
      setSelectedCountry(countryDisplayName);
      setSelectedCity(cityDisplayName);
      setAvailableCities(countryData.cities);
      // Save canonical names to localStorage
      setSavedLocation({ country: canonicalCountry, city: canonicalCity });
      setAppState('ready');
      setIsLocationModalOpen(false);
  
    } catch (e: any) {
      setError(e.message);
      setAppState('geo-fallback');
      toast({ variant: "destructive", title: t.notificationError, description: e.message });
    }
  }, [toast, language, t.notificationError, settings]);

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
      
      // Find the closest city from our list to the one from the geo API
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
      
      // Use the names from our JSON data to ensure consistency
      const cityToFetch = language === 'ar' ? matchedCityData.arabicName : matchedCityData.name;
      const countryToFetch = language === 'ar' ? countryData.arabicName : countryData.name;
      await fetchPrayerTimesByCity(cityToFetch, countryToFetch);
  
    } catch (e: any) {
      setError(e.message);
      setAppState('geo-fallback');
      toast({ variant: "destructive", title: t.notificationError, description: e.message });
    }
  }, [toast, t, fetchPrayerTimesByCity, language]);
  
  useEffect(() => {
    if (!hydrated) return; // Wait for localStorage to be loaded
    if (geoAttempted.current) return;
    geoAttempted.current = true;
    (async () => {
      if (savedLocation && savedLocation.country && savedLocation.city) {
        const canonicalCountry = getCanonicalCountryName(savedLocation.country);
        const canonicalCity = getCanonicalCityName(canonicalCountry, savedLocation.city);
        try {
          await fetchPrayerTimesByCity(canonicalCity, canonicalCountry);
          return; // Only proceed to geolocation if this fails
        } catch (e) {
          setSavedLocation(null);
          toast({
            variant: 'destructive',
            title: t.manualLocationPrompt,
            description: t.locationAccessDeniedDesc || 'Please reselect your location.',
          });
        }
      }
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
    })();
  }, [hydrated, fetchPrayerTimesFromCoords, toast, t, savedLocation, fetchPrayerTimesByCity]);
  
  const retryGeolocation = useCallback(() => {
    setAppState('loading');
    setError(null);
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
  
  const handleCountryChange = useCallback((countryIdentifier: string) => {
    const countryData = countries.find(c => c.name === countryIdentifier || c.arabicName === countryIdentifier);
    if (countryData) {
      const countryDisplayName = language === 'ar' ? countryData.arabicName : countryData.name;
      setSelectedCountry(countryDisplayName);
      setAvailableCities(countryData.cities);
      setSelectedCity('');
      // If city is set, update localStorage with canonical names
      if (countryData.name && selectedCity) {
        const canonicalCity = getCanonicalCityName(countryData.name, selectedCity);
        setSavedLocation({ country: countryData.name, city: canonicalCity });
      }
    }
  }, [language, selectedCity, setSavedLocation]);
  
  const handleCityChange = useCallback((cityIdentifier: string) => {
    const countryData = countries.find(c => c.name === getCanonicalCountryName(selectedCountry) || c.arabicName === selectedCountry);
    if (countryData) {
      const cityData = countryData.cities.find(c => c.name === cityIdentifier || c.arabicName === cityIdentifier);
      if (cityData) {
        const cityDisplayName = language === 'ar' ? cityData.arabicName : cityData.name;
        setSelectedCity(cityDisplayName);
        // If country is set, update localStorage with canonical names
        if (selectedCountry && cityData.name) {
          setSavedLocation({ country: countryData.name, city: cityData.name });
        }
      }
    }
  }, [availableCities, language, selectedCountry, setSavedLocation]);

  const handleManualLocationSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const countryData = countries.find(c => c.name === selectedCountry || c.arabicName === selectedCountry);
    if (selectedCity && countryData) {
      fetchPrayerTimesByCity(selectedCity, selectedCountry);
    }
  }, [selectedCity, selectedCountry, fetchPrayerTimesByCity]);

  return {
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
  };
}
