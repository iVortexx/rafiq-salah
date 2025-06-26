'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LocationForm } from './LocationForm';

interface GeoFallbackStateProps {
  error: string | null;
  translations: any;
  onLocationSet: (country: string, city: string) => void;
  retryGeolocation: () => void;
  language: 'ar' | 'en';
}

export const GeoFallbackState = ({ error, translations: t, onLocationSet, retryGeolocation, language }: GeoFallbackStateProps) => {
  const [loading, setLoading] = useState(false);

  const handleFormSubmit = (country: string, city: string) => {
    setLoading(true);
    onLocationSet(country, city);
    // The parent component will handle the loading state change from here.
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <Card className="w-full max-w-md mx-auto p-4 shadow-lg border-destructive/50">
        <CardHeader>
          <CardTitle className="font-bold text-center text-2xl text-primary">{t.welcome}</CardTitle>
          <CardDescription className="text-center pt-2 text-destructive">
            {error || t.manualLocationPrompt}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <button
            type="button"
            className="mb-4 w-full bg-primary text-white rounded px-4 py-2 font-semibold hover:bg-primary/90 transition"
            onClick={retryGeolocation}
          >
            {t.retryGeolocation}
          </button>
          <p className="text-center text-sm text-muted-foreground mb-4">{t.orSelectManually}</p>
          <LocationForm 
            onLocationSet={handleFormSubmit}
            translations={t}
            language={language}
            showSubmitButton={true}
            submitButtonLoading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
};
