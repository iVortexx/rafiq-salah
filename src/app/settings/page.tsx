"use client"

import type React from "react"

import { useState, useMemo, useEffect } from "react"
import { Bell, Clock, Sun, MapPin, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Header } from "@/components/prayer/Header"
import { LocationForm } from "@/components/prayer/LocationForm"
import { translations } from "@/lib/translations"
import { countries } from "@/lib/locations"
import { useLocalStorage } from '@/hooks/use-local-storage'
import { useToast } from '@/hooks/use-toast'
import { Button } from "@/components/ui/button"

export default function PrayerSettings() {
  // Language and theme state
  const [language, setLanguage] = useLocalStorage<'ar' | 'en'>('language', 'ar')
  const [theme, setTheme] = useState<"light" | "dark">("light")

  // Settings state
  const [recommendedSettings, setRecommendedSettings] = useState(true)
  const [manualLocation, setManualLocation] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [calculationMethod, setCalculationMethod] = useState("mwl")
  const [juristicMethod, setJuristicMethod] = useState("standard")
  const [highLatitudeAdjustment, setHighLatitudeAdjustment] = useState("none")
  const [daylightSaving, setDaylightSaving] = useState("0")

  // Location state
  const [selectedCountry, setSelectedCountry] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [locationLoading, setLocationLoading] = useState(false)

  const [prayerAdjustments, setPrayerAdjustments] = useState({
    fajr: 0,
    dhuhr: 0,
    asr: 0,
    maghrib: 0,
    isha: 0,
  })

  const { toast } = useToast()
  const [savedLocation, setSavedLocation] = useLocalStorage<{country: string, city: string} | null>('location', null)

  // Get current translations
  const t = translations[language]

  // Available cities based on selected country
  const availableCities = useMemo(() => {
    const country = countries.find((c) => c.name === selectedCountry || c.arabicName === selectedCountry)
    return country ? country.cities : []
  }, [selectedCountry])

  // Show current saved location
  const currentLocation = savedLocation ? `${savedLocation.city}, ${savedLocation.country}` : t.noLocationSaved

  // Use current location handler
  const handleUseCurrentLocation = () => {
    setLocationLoading(true)
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const geoResponse = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`)
            if (!geoResponse.ok) throw new Error('Failed to use reverse geocoding service.')
            const geoData = await geoResponse.json()
            const apiCity = geoData.city || geoData.locality
            const countryCode = geoData.countryCode
            const countryData = countries.find(c => c.code === countryCode)
            if (!countryData || !apiCity) throw new Error(t.manualLocationPrompt)
            const matchedCityData = countryData.cities.find(c => c.name.toLowerCase() === apiCity.toLowerCase())
            if (!matchedCityData) throw new Error(`${t.cityNotMatched}: "${apiCity}". ${t.manualLocationPrompt}`)
            const countryDisplayName = language === 'ar' ? countryData.arabicName : countryData.name
            const cityDisplayName = language === 'ar' ? matchedCityData.arabicName : matchedCityData.name
            setSelectedCountry(countryDisplayName)
            setSelectedCity(cityDisplayName)
            setSavedLocation({ country: countryDisplayName, city: cityDisplayName })
            toast({ title: t.locationSet, description: `${cityDisplayName}, ${countryDisplayName}`, variant: 'default' })
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

  // Location handlers
  const handleCountryChange = (countryName: string) => {
    setSelectedCountry(countryName)
    setSelectedCity("") // Reset city when country changes
  }

  const handleCityChange = (cityName: string) => {
    setSelectedCity(cityName)
  }

  const handleManualLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLocationLoading(true)
    // Simulate API call
    setTimeout(() => {
      setLocationLoading(false)
      console.log("Location set:", { country: selectedCountry, city: selectedCity })
    }, 1000)
  }

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

  const daylightSavingOptions = [
    { value: "0", label: t.noAdjustment },
    { value: "+1", label: t.plusOneHour },
    { value: "-1", label: t.minusOneHour },
  ]

  const prayers = [
    { key: "fajr", label: t.fajr },
    { key: "dhuhr", label: t.dhuhr },
    { key: "asr", label: t.asr },
    { key: "maghrib", label: t.maghrib },
    { key: "isha", label: t.isha },
  ]

  const handlePrayerAdjustment = (prayer: string, value: string) => {
    setPrayerAdjustments((prev) => ({
      ...prev,
      [prayer]: Number.parseInt(value) || 0,
    }))
  }

  // Save all settings to localStorage
  const [settings, setSettings] = useLocalStorage('settings', {
    recommendedSettings,
    notifications,
    calculationMethod,
    juristicMethod,
    highLatitudeAdjustment,
    daylightSaving,
    prayerAdjustments,
    language,
    theme,
  })

  // Remove auto-saving in each handler. Only update state, not localStorage.
  const handleNotificationsChange = (value: boolean) => {
    setNotifications(value);
  };
  const handleCalculationMethodChange = (value: string) => {
    setCalculationMethod(value);
  };
  const handleJuristicMethodChange = (value: string) => {
    setJuristicMethod(value);
  };
  const handleHighLatitudeAdjustmentChange = (value: string) => {
    setHighLatitudeAdjustment(value);
  };
  const handleDaylightSavingChange = (value: string) => {
    setDaylightSaving(value);
  };
  const handlePrayerAdjustmentChange = (prayer: string, value: string) => {
    setPrayerAdjustments((prev) => ({
      ...prev,
      [prayer]: Number.parseInt(value) || 0,
    }));
  };
  const handleLanguageChange = (value: 'ar' | 'en') => {
    setLanguage(value);
  };
  const handleThemeChange = (value: 'light' | 'dark') => {
    setTheme(value);
  };
  const handleRecommendedSettingsChange = (value: boolean) => {
    setRecommendedSettings(value);
    setSettings({
      recommendedSettings: value,
      notifications,
      calculationMethod,
      juristicMethod,
      highLatitudeAdjustment,
      daylightSaving,
      prayerAdjustments,
      language,
      theme,
    });
  };

  // Save settings handler
  const handleSaveSettings = () => {
    setSettings({
      recommendedSettings,
      notifications,
      calculationMethod,
      juristicMethod,
      highLatitudeAdjustment,
      daylightSaving,
      prayerAdjustments,
      language,
      theme,
    });
    toast({ title: t.saveSettings, description: t.settingsSaved || 'Settings saved successfully!', variant: 'default' });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        title={t.prayerSettings}
        language={language}
        setLanguage={setLanguage}
        theme={theme}
        setTheme={setTheme}
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
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="manual-location" className="text-base font-medium">
                    {t.useManualLocation}
                  </Label>
                  <p className="text-sm text-muted-foreground">{t.useManualLocationDesc}</p>
                  <p className="text-sm mt-2"><strong>{t.currentLocation}:</strong> {currentLocation}</p>
                </div>
                <Switch id="manual-location" checked={manualLocation} onCheckedChange={setManualLocation} />
              </div>
              <Button type="button" className="w-full" onClick={handleUseCurrentLocation} disabled={locationLoading}>
                {locationLoading ? <Loader2 className="ms-2 h-4 w-4 animate-spin" /> : <MapPin className="ms-2 h-4 w-4" />}
                {t.useCurrentLocation}
              </Button>

              {manualLocation && (
                <>
                  <Separator />
                  <LocationForm
                    selectedCountry={selectedCountry}
                    selectedCity={selectedCity}
                    availableCities={availableCities}
                    loading={locationLoading}
                    handleCountryChange={handleCountryChange}
                    handleCityChange={handleCityChange}
                    handleManualLocationSubmit={handleManualLocationSubmit}
                    language={language}
                    translations={t}
                  />
                </>
              )}
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
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="recommended" className="text-base font-medium">
                    {t.useRecommendedSettings}
                  </Label>
                  <p className="text-sm text-muted-foreground">{t.useRecommendedSettingsDesc}</p>
                </div>
                <Switch id="recommended" checked={recommendedSettings} onCheckedChange={handleRecommendedSettingsChange} />
              </div>

              {!recommendedSettings && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold">{t.timeCalculation}</h4>

                    {/* Calculation Method */}
                    <div className="space-y-2">
                      <Label htmlFor="calculation-method">{t.calculationMethod}</Label>
                      <Select value={calculationMethod} onValueChange={handleCalculationMethodChange}>
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
                      <Select value={juristicMethod} onValueChange={handleJuristicMethodChange}>
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

                    {/* Manual Settings */}
                    <div className="space-y-4">
                      <h5 className="font-medium">{t.manualSettings}</h5>

                      {/* High Latitude Adjustment */}
                      <div className="space-y-2">
                        <Label htmlFor="high-latitude">{t.highLatitudeAdjustment}</Label>
                        <Select value={highLatitudeAdjustment} onValueChange={handleHighLatitudeAdjustmentChange}>
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
                                value={prayerAdjustments[prayer.key as keyof typeof prayerAdjustments]}
                                onChange={(e) => handlePrayerAdjustmentChange(prayer.key, e.target.value)}
                                className="w-20"
                                min="-30"
                                max="30"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Time Adjustments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sun className="h-5 w-5 text-accent" />
                {t.timeAdjustments}
              </CardTitle>
              <CardDescription>{t.timeAdjustmentsDesc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Daylight Saving Time */}
              <div className="space-y-2">
                <Label htmlFor="daylight-saving">{t.daylightSavingTime}</Label>
                <Select value={daylightSaving} onValueChange={handleDaylightSavingChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select daylight saving adjustment" />
                  </SelectTrigger>
                  <SelectContent>
                    {daylightSavingOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Switch id="notifications" checked={notifications} onCheckedChange={handleNotificationsChange} />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-center pt-4">
            <Button className="w-full mt-6" onClick={handleSaveSettings}>{t.saveSettings}</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
