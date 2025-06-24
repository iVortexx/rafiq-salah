
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LocationForm, type LocationFormProps } from './LocationForm';

interface GeoFallbackStateProps {
  error: string | null;
  translations: any;
  locationFormProps: Omit<LocationFormProps, 'translations'>;
}

export const GeoFallbackState = ({ error, translations: t, locationFormProps }: GeoFallbackStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <Card className="w-full max-w-md mx-auto p-4 shadow-lg border-destructive/50">
        <CardHeader>
          <CardTitle className="font-bold text-center text-2xl text-primary">{t.welcome}</CardTitle>
          <CardDescription className="text-center text-muted-foreground pt-2 text-destructive">
            {error || t.manualLocationPrompt}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LocationForm 
            {...locationFormProps}
            translations={t}
          />
        </CardContent>
      </Card>
    </div>
  );
};
