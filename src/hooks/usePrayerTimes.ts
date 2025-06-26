'use client';

import { useState, useCallback, useMemo } from 'react';
import { useToast } from "@/hooks/use-toast";
import type { AladhanResponse, PrayerData, Settings } from '@/types/prayer';
import { countries } from '@/lib/locations';

type AppState = 'loading' | 'ready' | 'error' | 'geo-fallback';

// Helper to get canonical (English) names from any language name
function getCanonicalCountryName(name: string): string {
  const country = countries.find(c => c.name === name || c.arabicName === name);
  return country ? country.name : name;
}
function getCanonicalCityName(countryName: string, cityName: string): string {
  const canonicalCountry = getCanonicalCountryName(countryName);
  const country = countries.find(c => c.name === canonicalCountry);
  if (!country) return cityName;
  const city = country.cities.find(c => c.name === cityName || c.arabicName === cityName);
  return city ? city.name : cityName;
}

export function usePrayerTimes(settings: Settings, language: 'ar' | 'en', t: any) {
  const [appState, setAppState] = useState<AppState>('loading');
  const [prayerData, setPrayerData] = useState<PrayerData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { toast } = useToast();

  const displayLocation = useMemo(() => {
    if (!prayerData || !settings.location) return t.loadingLocation;

    const countryData = countries.find(c => c.name === settings.location?.country);
    if (!countryData) return t.loadingLocation;
    
    const cityData = countryData.cities.find(c => c.name === settings.location?.city);
    if (!cityData) return t.loadingLocation;

    const countryDisplayName = language === 'ar' ? countryData.arabicName : countryData.name;
    const cityDisplayName = language === 'ar' ? cityData.arabicName : cityData.name;

    return `${cityDisplayName}, ${countryDisplayName}`;
  }, [prayerData, settings.location, language, t]);


  const methodMap: Record<string, number> = {
    mwl: 3, isna: 2, egypt: 5, makkah: 4, karachi: 1, tehran: 7, jafari: 8,
  };

  const fetchPrayerTimesByCity = useCallback(async (cityIdentifier: string, countryIdentifier: string) => {
    setAppState('loading');
    setError(null);
  
    try {
      const canonicalCountry = getCanonicalCountryName(countryIdentifier);
      const canonicalCity = getCanonicalCityName(canonicalCountry, cityIdentifier);
      const countryData = countries.find(c => c.name === canonicalCountry);
      if (!countryData) throw new Error("Invalid country selected.");
  
      const cityData = countryData.cities.find(c => c.name === canonicalCity);
      if (!cityData) throw new Error("Invalid city selected.");
      
      const method = settings.calculationMethod && methodMap[settings.calculationMethod]
        ? methodMap[settings.calculationMethod]
        : countryData.method;

      const school = settings.juristicMethod === 'hanafi' ? 1 : 0;

      let latitudeAdjustmentMethod = 'NONE';
      if (settings.highLatitudeAdjustment === 'midnight') latitudeAdjustmentMethod = 'MIDNIGHT';
      else if (settings.highLatitudeAdjustment === 'oneseventh') latitudeAdjustmentMethod = 'ONE_SEVENTH';
      else if (settings.highLatitudeAdjustment === 'anglebased') latitudeAdjustmentMethod = 'ANGLE_BASED';
      
      const hourAdjustment = settings.hourAdjustment || 0;
      
      const pa = settings.prayerAdjustments || {};
      const tune = [0, pa.fajr || 0, 0, pa.dhuhr || 0, pa.asr || 0, pa.maghrib || 0, 0, pa.isha || 0, 0].join(',');
      
      const today = new Date();
      const dateString = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
  
      let url = `https://api.aladhan.com/v1/timingsByCity/${dateString}?city=${encodeURIComponent(cityData.arabicName)}&country=${encodeURIComponent(countryData.arabicName)}&method=${method}`;
      url += `&school=${school}`;
      url += `&latitudeAdjustmentMethod=${latitudeAdjustmentMethod}`;
      url += `&tune=${tune}`;
      url += `&adjustment=${hourAdjustment}`; // Use 'adjustment' for DST/hour changes
  
      const response = await fetch(url);
      if (!response.ok) throw new Error(t.notificationErrorDesc);
      
      const data: AladhanResponse = await response.json();
      if (data.code !== 200) throw new Error(data.status || 'An unknown error occurred.');
      
      setPrayerData(data.data);
      setAppState('ready');
  
    } catch (e: any) {
      setError(e.message);
      setAppState('geo-fallback');
      toast({ variant: "destructive", title: t.notificationError, description: e.message });
    }
  }, [toast, t, settings]);


  const fetchPrayerTimesFromCoords = useCallback(async (latitude: number, longitude: number): Promise<{country: string, city: string} | null> => {
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
        return null;
      }
      
      const matchedCityData = countryData.cities.find(c => c.name.toLowerCase() === apiCity.toLowerCase());
      if (!matchedCityData) {
        setAppState('geo-fallback');
        const errorMessage = `${t.cityNotMatched}: "${apiCity}". ${t.manualLocationPrompt}`;
        setError(errorMessage);
        toast({ variant: "destructive", title: t.cityNotMatched, description: `Could not automatically match your city "${apiCity}". Please select it manually.` });
        return null;
      }
      
      await fetchPrayerTimesByCity(matchedCityData.name, countryData.name);
      return { country: countryData.name, city: matchedCityData.name };
  
    } catch (e: any) {
      setError(e.message);
      setAppState('geo-fallback');
      toast({ variant: "destructive", title: t.notificationError, description: e.message });
      return null;
    }
  }, [toast, t, fetchPrayerTimesByCity]);


  return {
    appState,
    prayerData,
    error,
    displayLocation,
    fetchPrayerTimesByCity,
    fetchPrayerTimesFromCoords,
    setAppState,
    setError,
  };
}
