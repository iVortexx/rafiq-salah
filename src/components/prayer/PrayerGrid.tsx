
'use client';

import { memo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Prayer } from '@/lib/time';

interface PrayerGridProps {
  prayers: Prayer[];
  nextPrayerName?: string;
}

export const PrayerGrid = memo(({ prayers, nextPrayerName }: PrayerGridProps) => {
  return (
    <section className="mb-10">
       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {prayers.map((prayer) => (
            <Card key={prayer.name} className={cn(
              'text-center transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-1',
              prayer.name === nextPrayerName ? 'bg-primary/10 border-accent ring-2 ring-accent' : 'bg-card'
              )}>
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-xl font-medium">{prayer.displayName}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold font-mono">{prayer.time}</div>
              </CardContent>
            </Card>
          ))}
       </div>
    </section>
  );
});

PrayerGrid.displayName = 'PrayerGrid';
