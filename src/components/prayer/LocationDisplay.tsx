
'use client';

import { memo, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MapPin, Pencil } from 'lucide-react';
import type { LocationFormProps } from './LocationForm';
import { LocationForm } from './LocationForm';

interface LocationDisplayProps {
  gregorianDate: string;
  hijriDate: string;
  displayLocation: string;
  changeLocationLabel: string;
  onLocationSet: (country: string, city: string) => void;
  language: 'ar' | 'en';
  translations: any;
}

export const LocationDisplay = memo(({
  gregorianDate,
  hijriDate,
  displayLocation,
  changeLocationLabel,
  onLocationSet,
  language,
  translations
}: LocationDisplayProps) => {
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const handleLocationSubmit = (country: string, city: string) => {
    onLocationSet(country, city);
    setIsLocationModalOpen(false);
  }

  return (
    <section className="text-center mb-8">
      <p className="text-lg text-muted-foreground">{gregorianDate}</p>
      <p className="text-xl text-accent font-semibold">{hijriDate}</p>
      <div className="flex items-center justify-center gap-2 mt-4">
        <MapPin className="w-5 h-5 text-muted-foreground" />
        <span className="text-lg text-foreground">{displayLocation}</span>
        <Dialog open={isLocationModalOpen} onOpenChange={setIsLocationModalOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Pencil className="w-4 h-4" />
              <span className="sr-only">{changeLocationLabel}</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{changeLocationLabel}</DialogTitle>
            </DialogHeader>
            <div className="pt-4">
              <LocationForm 
                onLocationSet={handleLocationSubmit}
                language={language}
                translations={translations}
                showSubmitButton={true}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
});
LocationDisplay.displayName = 'LocationDisplay';
