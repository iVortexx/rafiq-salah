
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LocationForm, type LocationFormProps } from './LocationForm';

interface GeoFallbackStateProps extends Omit<LocationFormProps, 'translations'> {
  error: string | null;
  translations: any;
}

export const GeoFallbackState = ({ error, translations: t, ...locationFormProps }: GeoFallbackStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <Card className="w-full max-w-md mx-4 p-4 shadow-lg">
        <CardHeader>
          <CardTitle className="font-bold text-center text-3xl text-primary">{t.welcome}</CardTitle>
          <CardDescription className="text-center text-muted-foreground pt-2">
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
