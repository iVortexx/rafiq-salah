
'use client';

import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  translations: any;
}

export const LoadingState = ({ translations: t }: LoadingStateProps) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
    <Loader2 className="w-16 h-16 animate-spin text-primary" />
    <p className="mt-4 text-lg font-semibold">{t.loadingLocation}</p>
  </div>
);
