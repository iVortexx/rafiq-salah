"use client"

import type React from "react"

import { memo, useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandList, CommandItem } from "@/components/ui/command"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { ChevronsUpDown, Check, MapPin, Loader2 } from "lucide-react"
import { countries, type City } from "@/lib/locations"

export interface LocationFormProps {
  onLocationSet: (country: string, city: string) => void;
  language: "ar" | "en";
  translations: any;
  initialLocation?: { country: string; city: string } | null;
  showSubmitButton?: boolean;
  submitButtonLoading?: boolean;
}

export const LocationForm = memo(
  ({
    onLocationSet,
    language,
    translations: t,
    initialLocation = null,
    showSubmitButton = false,
    submitButtonLoading = false,
  }: LocationFormProps) => {
    const [selectedCountry, setSelectedCountry] = useState<string>("");
    const [selectedCity, setSelectedCity] = useState<string>("");
    const [countryOpen, setCountryOpen] = useState(false);
    const [cityOpen, setCityOpen] = useState(false);

    useEffect(() => {
        if (initialLocation) {
            const countryData = countries.find(c => c.name === initialLocation.country);
            if (countryData) {
                const countryDisplayName = language === 'ar' ? countryData.arabicName : countryData.name;
                setSelectedCountry(countryDisplayName);

                const cityData = countryData.cities.find(c => c.name === initialLocation.city);
                if (cityData) {
                    const cityDisplayName = language === 'ar' ? cityData.arabicName : cityData.name;
                    setSelectedCity(cityDisplayName);
                } else {
                  setSelectedCity("");
                }
            }
        } else {
            setSelectedCountry("");
            setSelectedCity("");
        }
    }, [initialLocation, language]);


    const handleCountryChange = (countryIdentifier: string) => {
      setSelectedCountry(countryIdentifier)
      setSelectedCity("") // Reset city when country changes
      if (!showSubmitButton) {
        onLocationSet(countryIdentifier, "");
      }
    };
  
    const handleCityChange = (cityIdentifier: string) => {
      setSelectedCity(cityIdentifier);
      if (!showSubmitButton) {
        onLocationSet(selectedCountry, cityIdentifier);
      }
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (showSubmitButton && selectedCountry && selectedCity) {
        onLocationSet(selectedCountry, selectedCity);
      }
    }

    const availableCities = useMemo(() => {
        if (!selectedCountry) return [];
        const country = countries.find((c) => c.name === selectedCountry || c.arabicName === selectedCountry);
        return country ? country.cities : [];
      }, [selectedCountry]);
      
    const selectedCountryData = useMemo(() => {
        if (!selectedCountry) return null;
        return countries.find((c) => c.name === selectedCountry || c.arabicName === selectedCountry)
      }, [selectedCountry]);

    const selectedCityData = useMemo(() => {
      if (!selectedCity) return null;
      return availableCities.find((c) => c.name === selectedCity || c.arabicName === selectedCity)
    }, [availableCities, selectedCity]);

    const getCountryDisplayName = (country: (typeof countries)[0]) =>
      language === "ar" ? country.arabicName : country.name
    const getCityDisplayName = (city: City) => (language === "ar" ? city.arabicName : city.name)

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label>{t.country}</Label>
          <Popover open={countryOpen} onOpenChange={setCountryOpen} modal={true}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={countryOpen}
                className="w-full justify-between text-base md:text-sm"
              >
                {selectedCountryData ? getCountryDisplayName(selectedCountryData) : t.selectCountry}
                <ChevronsUpDown className="ms-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
              <Command>
                <CommandInput placeholder={t.searchCountry} />
                <CommandList>
                  <CommandEmpty>{t.countryNotFound}</CommandEmpty>
                  <CommandGroup>
                    {countries.map((country) => {
                      const countryDisplayName = getCountryDisplayName(country)
                      return (
                        <CommandItem
                          key={country.code}
                          value={countryDisplayName}
                          onSelect={(currentValue) => {
                            handleCountryChange(currentValue)
                            setCountryOpen(false)
                          }}
                        >
                          <Check
                            className={cn(
                              "me-2 h-4 w-4",
                              selectedCountry === countryDisplayName
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          {countryDisplayName}
                        </CommandItem>
                      )
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <Label>{t.city}</Label>
          <Popover open={cityOpen} onOpenChange={setCityOpen} modal={true}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={cityOpen}
                className="w-full justify-between text-base md:text-sm"
                disabled={!selectedCountry}
              >
                {selectedCityData ? getCityDisplayName(selectedCityData) : t.selectCity}
                <ChevronsUpDown className="ms-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
              <Command>
                <CommandInput placeholder={t.searchCity} />
                <CommandList>
                  <CommandEmpty>{t.cityNotFound}</CommandEmpty>
                  <CommandGroup>
                    {availableCities.map((city) => {
                      const cityDisplayName = getCityDisplayName(city)
                      return (
                        <CommandItem
                          key={city.name}
                          value={cityDisplayName}
                          onSelect={(currentValue) => {
                            handleCityChange(currentValue)
                            setCityOpen(false)
                          }}
                        >
                          <Check
                            className={cn(
                              "me-2 h-4 w-4",
                              selectedCity === cityDisplayName
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          {cityDisplayName}
                        </CommandItem>
                      )
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        {showSubmitButton && (
            <Button type="submit" className="w-full" disabled={submitButtonLoading || !selectedCity || !selectedCountry}>
                {submitButtonLoading ? <Loader2 className="ms-2 h-4 w-4 animate-spin" /> : <MapPin className="ms-2 h-4 w-4" />}
                {t.getPrayerTimes}
            </Button>
        )}
      </form>
    )
  },
)
LocationForm.displayName = "LocationForm"
