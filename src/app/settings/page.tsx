"use client"

import type React from "react"
import { useState, useMemo, useEffect } from "react"
import { Bell, Clock, Sun, MapPin, Loader2, Save } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Header } from "@/components/prayer/Header"
import { LocationForm } from "@/components/prayer/LocationForm"
import { translations } from "@/lib/translations"
import { countries } from "@/lib/locations"
import { useLocalStorage } from '@/hooks/use-local-storage'
import { useToast } from '@/hooks/use-toast'
import { Button } from "@/components/ui/button"
import type { Settings } from "@/types/prayer"

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

export default function PrayerSettingsPage() {
  const [savedSettings, setSavedSettings] = useLocalStorage<Settings>('settings', defaultSettings)
  const [localSettings, setLocalSettings] = useState<Settings>(savedSettings)
  const [locationLoading, setLocationLoading] = useState(false)
  
  const { toast } = useToast()

  // When saved settings are loaded from localStorage or changed in another tab, update the local form state.
  useEffect(() => {
    setLocalSettings(savedSettings)
  }, [savedSettings])

  const language = localSettings.language
  const t = translations[language]

  const handleLanguageChange = (lang: 'ar' | 'en') => {
    setLocalSettings(prev => ({ ...prev, language: lang }));
  };

  const handleThemeChange = (theme: 'light' | 'dark') => {
    setLocalSettings(prev => ({ ...prev, theme: theme }));
  };
  
  // Handlers for form inputs to update local state
  const handleSettingChange = (key: keyof Settings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }))
  }

  const handlePrayerAdjustmentChange = (prayer: keyof Settings['prayerAdjustments'], value: string) => {
    setLocalSettings(prev => ({
      ...prev,
      prayerAdjustments: {
        ...prev.prayerAdjustments,
        [prayer]: Number.parseInt(value) || 0,
      }
    }))
  }

  const handleUseCurrentLocation = () => {
    setLocationLoading(true)
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const geoResponse = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`)
            if (!geoResponse.ok) throw new Error(t.geolocationNotSupportedDesc)
            
            const geoData = await geoResponse.json()
            const apiCity = geoData.city || geoData.locality
            const countryCode = geoData.countryCode
            const countryData = countries.find(c => c.code === countryCode)

            if (!countryData || !apiCity) throw new Error(t.manualLocationPrompt)
            
            const matchedCityData = countryData.cities.find(c => c.name.toLowerCase() === apiCity.toLowerCase())
            if (!matchedCityData) throw new Error(`${t.cityNotMatched}: "${apiCity}". ${t.manualLocationPrompt}`)
            
            setLocalSettings(prev => ({
              ...prev,
              location: {
                country: countryData.name, // Store canonical English name
                city: matchedCityData.name, // Store canonical English name
              }
            }))

            toast({ title: t.locationSet, description: `${matchedCityData.name}, ${countryData.name}` })
          } catch (e: any) {
            toast({ title: t.locationAccessDenied, description: e.message, variant: 'destructive' })
          } finally {
            setLocationLoading(false)
          }
        },
        (err) => {
          toast({ title: t.locationAccessDenied, description: t.locationAccessDeniedDesc, variant: 'destructive' })
          setLocationLoading(false)
        }
      )
    } else {
      toast({ title: t.geolocationNotSupported, description: t.geolocationNotSupportedDesc, variant: 'destructive' })
      setLocationLoading(false)
    }
  }

  const handleManualLocationSelect = (countryName: string, cityName: string) => {
     const countryData = countries.find(c => c.name === countryName || c.arabicName === countryName);
     const cityData = countryData?.cities.find(c => c.name === cityName || c.arabicName === cityName);
     if (countryData && cityData) {
       setLocalSettings(prev => ({
         ...prev,
         location: { country: countryData.name, city: cityData.name }
       }))
     }
  }

  // Save all local changes to localStorage
  const handleSaveSettings = () => {
    setSavedSettings(localSettings)
    toast({ title: t.settingsSaved, description: t.settingsSavedDesc, variant: 'default' })
  };

  const calculationMethods = [
    { value: "mwl", label: t.mwl },
    { value: "isna", label: t.isna },
    { value: "egypt", label: t.egypt },
    { value: "makkah", label: t.makkah },
    { value: "karachi", label: t.karachi },
    { value: "tehran", label: t.tehran },
    { value: "jafari", label: t.jafari },
  ]

  const juristicMethods = [
    { value: "standard", label: t.standard },
    { value: "hanafi", label: t.hanafi },
  ]

  const highLatitudeOptions = [
    { value: "none", label: t.none },
    { value: "midnight", label: t.midnight },
    { value: "oneseventh", label: t.oneseventh },
    { value: "anglebased", label: t.anglebased },
  ]

  const hourAdjustmentOptions = [
    { value: 0, label: t.noAdjustment },
    { value: 1, label: t.plusOneHour },
    { value: -1, label: t.minusOneHour },
  ]

  const prayers = [
    { key: "fajr" as const, label: t.fajr },
    { key: "dhuhr" as const, label: t.dhuhr },
    { key: "asr" as const, label: t.asr },
    { key: "maghrib" as const, label: t.maghrib },
    { key: "isha" as const, label: t.isha },
  ]
  
  const currentLocation = useMemo(() => {
    if (!localSettings.location) return t.noLocationSaved;

    const countryData = countries.find(c => c.name === localSettings.location?.country);
    const cityData = countryData?.cities.find(c => c.name === localSettings.location?.city);

    if (!countryData || !cityData) return t.noLocationSaved;
    
    return language === 'ar' 
      ? `${cityData.arabicName}, ${countryData.arabicName}`
      : `${cityData.name}, ${countryData.name}`;

  }, [localSettings.location, language, t]);

  return (
    <div className="min-h-screen bg-background">
      <Header
        title={t.prayerSettings}
        language={language}
        setLanguage={handleLanguageChange}
        theme={localSettings.theme}
        setTheme={handleThemeChange}
      />

      <div className="container mx-auto px-4 pb-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Location Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                {t.locationSettings}
              </CardTitle>
              <CardDescription>{t.locationSettingsDesc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button type="button" className="w-full" onClick={handleUseCurrentLocation} disabled={locationLoading}>
                {locationLoading ? <Loader2 className="ms-2 h-4 w-4 animate-spin" /> : <MapPin className="ms-2 h-4 w-4" />}
                {t.useCurrentLocation}
              </Button>
               <p className="text-sm text-center"><strong>{t.currentLocation}:</strong> {currentLocation}</p>
              <LocationForm
                onLocationSet={handleManualLocationSelect}
                language={language}
                translations={t}
                initialLocation={localSettings.location}
              />
            </CardContent>
          </Card>

          {/* Calculation Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                {t.calculationSettings}
              </CardTitle>
              <CardDescription>{t.calculationSettingsDesc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Calculation Method */}
              <div className="space-y-2">
                <Label htmlFor="calculation-method">{t.calculationMethod}</Label>
                <Select value={localSettings.calculationMethod} onValueChange={(v) => handleSettingChange('calculationMethod', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select calculation method" />
                  </SelectTrigger>
                  <SelectContent>
                    {calculationMethods.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Juristic Method */}
              <div className="space-y-2">
                <Label htmlFor="juristic-method">{t.juristicMethod}</Label>
                <Select value={localSettings.juristicMethod} onValueChange={(v) => handleSettingChange('juristicMethod', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select juristic method" />
                  </SelectTrigger>
                  <SelectContent>
                    {juristicMethods.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          
          {/* Advanced Calculation Settings */}
          <Card>
             <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-accent" />
                    {t.manualSettings}
                </CardTitle>
                <CardDescription>{t.timeAdjustmentsDesc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* High Latitude Adjustment */}
                <div className="space-y-2">
                <Label htmlFor="high-latitude">{t.highLatitudeAdjustment}</Label>
                <Select value={localSettings.highLatitudeAdjustment} onValueChange={(v) => handleSettingChange('highLatitudeAdjustment', v)}>
                    <SelectTrigger>
                    <SelectValue placeholder="Select adjustment method" />
                    </SelectTrigger>
                    <SelectContent>
                    {highLatitudeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                        {option.label}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                </div>

                {/* Hour Adjustment */}
                <div className="space-y-2">
                    <Label htmlFor="hour-adjustment">{t.hourAdjustment}</Label>
                    <Select value={String(localSettings.hourAdjustment)} onValueChange={(v) => handleSettingChange('hourAdjustment', Number(v))}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select hour adjustment" />
                    </SelectTrigger>
                    <SelectContent>
                        {hourAdjustmentOptions.map((option) => (
                        <SelectItem key={option.value} value={String(option.value)}>
                            {option.label}
                        </SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                </div>

                {/* Prayer Time Adjustments */}
                <div className="space-y-3">
                <Label>{t.prayerTimeAdjustments}</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {prayers.map((prayer) => (
                    <div key={prayer.key} className="flex items-center gap-2">
                        <Label htmlFor={prayer.key} className="min-w-16 text-sm">
                        {prayer.label}:
                        </Label>
                        <Input
                        id={prayer.key}
                        type="number"
                        value={localSettings.prayerAdjustments[prayer.key as keyof typeof localSettings.prayerAdjustments]}
                        onChange={(e) => handlePrayerAdjustmentChange(prayer.key, e.target.value)}
                        className="w-20"
                        min="-60"
                        max="60"
                        />
                    </div>
                    ))}
                </div>
                </div>
            </CardContent>
          </Card>


          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                {t.notifications}
              </CardTitle>
              <CardDescription>{t.notificationsDesc}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications" className="text-base font-medium">
                    {t.enableNotifications}
                  </Label>
                  <p className="text-sm text-muted-foreground">{t.enableNotificationsDesc}</p>
                </div>
                <Switch id="notifications" checked={localSettings.notifications} onCheckedChange={(v) => handleSettingChange('notifications', v)} />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-center pt-4">
            <Button className="w-full mt-6" onClick={handleSaveSettings}>
                <Save />
                {t.saveSettings}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
