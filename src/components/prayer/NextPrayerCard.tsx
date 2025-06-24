
'use client';

import { memo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { Prayer } from '@/lib/time';

interface NextPrayerCardProps {
  nextPrayer: Prayer;
  countdown: string;
  nextPrayerLabel: string;
}

export const NextPrayerCard = memo(({ nextPrayer, countdown, nextPrayerLabel }: NextPrayerCardProps) => {
  return (
    <section className="mb-10">
      <Card className="w-full max-w-2xl mx-auto bg-card border-primary/20 shadow-2xl shadow-primary/10">
        <CardHeader className="text-center pb-2">
          <p className="text-lg text-primary font-semibold">{nextPrayerLabel}</p>
          <CardTitle className="font-bold text-5xl text-foreground">{nextPrayer.displayName}</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="font-mono text-6xl md:text-7xl font-bold text-primary tracking-tight">{countdown}</p>
          <p className="text-2xl text-muted-foreground">{nextPrayer.time}</p>
        </CardContent>
      </Card>
    </section>
  );
});

NextPrayerCard.displayName = 'NextPrayerCard';
