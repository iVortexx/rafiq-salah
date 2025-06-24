
'use client';

import { memo, useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandList, CommandItem } from '@/components/ui/command';
import { Label } from "@/components/ui/label";
import { cn } from '@/lib/utils';
import { ChevronsUpDown, Check, MapPin, Loader2 } from 'lucide-react';
import { countries, type City } from '@/lib/locations';

export interface LocationFormProps {
  selectedCountry: string;
  selectedCity: string;
  availableCities: City[];
  loading: boolean;
  handleCountryChange: (countryName: string) => void;
  handleCityChange: (cityName: string) => void;
  handleManualLocationSubmit: (e: React.FormEvent) => void;
  language: 'ar' | 'en';
  translations: any;
}

export const LocationForm = memo(({
  selectedCountry,
  selectedCity,
  availableCities,
  loading,
  handleCountryChange,
  handleCityChange,
  handleManualLocationSubmit,
  language,
  translations: t,
}: LocationFormProps) => {
  const [countryOpen, setCountryOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);

  const selectedCountryData = useMemo(() => countries.find(c => c.name === selectedCountry || c.arabicName === selectedCountry), [selectedCountry]);
  
  const selectedCityData = useMemo(() => {
    if (!selectedCity) return null;
    return availableCities.find(c => c.name === selectedCity || c.arabicName === selectedCity);
  }, [availableCities, selectedCity]);
  
  const getCountryDisplayName = (country: typeof countries[0]) => language === 'ar' ? country.arabicName : country.name;
  const getCityDisplayName = (city: City) => language === 'ar' ? city.arabicName : city.name;

  return (
   <form onSubmit={handleManualLocationSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>{t.country}</Label>
        <Popover open={countryOpen} onOpenChange={setCountryOpen} modal={true}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" aria-expanded={countryOpen} className="w-full justify-between text-base md:text-sm">
              {selectedCountryData ? getCountryDisplayName(selectedCountryData) : t.selectCountry}
              <ChevronsUpDown className="ms-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" position="popper">
            <Command>
              <CommandInput placeholder={t.searchCountry} />
              <CommandList>
                <CommandEmpty>{t.countryNotFound}</CommandEmpty>
                <CommandGroup>
                  {countries.map((country) => {
                    const countryDisplayName = getCountryDisplayName(country);
                    return (
                      <CommandItem
                        key={country.code}
                        value={countryDisplayName}
                        onSelect={(currentValue) => {
                           handleCountryChange(currentValue);
                           setCountryOpen(false);
                        }}
                      >
                        <Check className={cn("me-2 h-4 w-4", (selectedCountryData && getCountryDisplayName(selectedCountryData) === countryDisplayName) ? "opacity-100" : "opacity-0")} />
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
            <Button variant="outline" role="combobox" aria-expanded={cityOpen} className="w-full justify-between text-base md:text-sm" disabled={!selectedCountry}>
              {selectedCityData ? getCityDisplayName(selectedCityData) : t.selectCity}
              <ChevronsUpDown className="ms-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" position="popper">
             <Command>
              <CommandInput placeholder={t.searchCity} />
               <CommandList>
                <CommandEmpty>{t.cityNotFound}</CommandEmpty>
                <CommandGroup>
                  {availableCities.map((city) => {
                    const cityDisplayName = getCityDisplayName(city);
                    return (
                      <CommandItem
                        key={city.name}
                        value={cityDisplayName}
                        onSelect={(currentValue) => {
                          handleCityChange(currentValue);
                          setCityOpen(false);
                        }}
                      >
                        <Check className={cn("me-2 h-4 w-4", (selectedCityData && getCityDisplayName(selectedCityData) === cityDisplayName) ? "opacity-100" : "opacity-0")} />
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
      <Button type="submit" className="w-full" disabled={loading || !selectedCity || !selectedCountry}>
        {loading ? <Loader2 className="ms-2 h-4 w-4 animate-spin" /> : <MapPin className="ms-2 h-4 w-4" />}
        {t.getPrayerTimes}
      </Button>
    </form>
  );
});
LocationForm.displayName = 'LocationForm';
