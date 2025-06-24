
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import type { AladhanResponse, PrayerData } from '@/types/prayer';
import type { City } from '@/lib/locations';
import { countries } from '@/lib/locations';

type AppState = 'loading' | 'ready' | 'error' | 'geo-fallback';

export function usePrayerTimes(language: 'ar' | 'en', t: any) {
  const [appState, setAppState] = useState<AppState>('loading');
  const [prayerData, setPrayerData] = useState<PrayerData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [availableCities, setAvailableCities] = useState<City[]>([]);

  const [displayLocation, setDisplayLocation] = useState('');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const { toast } = useToast();

  const fetchPrayerTimesByCity = useCallback(async (cityIdentifier: string, countryIdentifier: string) => {
    setAppState('loading');
    setError(null);
  
    try {
      const countryData = countries.find(c => c.name === countryIdentifier || c.arabicName === countryIdentifier);
      if (!countryData) throw new Error("Invalid country selected.");
  
      const cityData = countryData.cities.find(c => c.name === cityIdentifier || c.arabicName === cityIdentifier);
      if (!cityData) throw new Error("Invalid city selected.");
      
      const method = countryData.method;
      const today = new Date();
      const dateString = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
  
      // The API needs the Arabic city and country name to function correctly
      const url = `https://api.aladhan.com/v1/timingsByCity/${dateString}?city=${cityData.arabicName}&country=${countryData.arabicName}&method=${method}`;
  
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch prayer times. Please check your internet connection.');
      const data: AladhanResponse = await response.json();
      if (data.code !== 200) throw new Error(data.status || 'An unknown error occurred.');
      
      setPrayerData(data.data);
      
      const countryDisplayName = language === 'ar' ? countryData.arabicName : countryData.name;
      const cityDisplayName = language === 'ar' ? cityData.arabicName : cityData.name;
      
      setDisplayLocation(`${cityDisplayName}, ${countryDisplayName}`);
      setSelectedCountry(countryDisplayName);
      setSelectedCity(cityDisplayName);
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
  };
}
