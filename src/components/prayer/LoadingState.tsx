
'use client';

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const LoadingState = () => (
  <>
    {/* Skeleton for LocationDisplay */}
    <section className="text-center mb-8 flex flex-col items-center gap-2">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-7 w-56" />
      <Skeleton className="h-8 w-64 mt-2" />
    </section>

    {/* Skeleton for NextPrayerCard */}
    <section className="mb-10">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center pb-2 items-center">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-14 w-48 mt-2" />
        </CardHeader>
        <CardContent className="text-center flex flex-col items-center">
          <Skeleton className="h-20 w-80" />
          <Skeleton className="h-8 w-24 mt-2" />
        </CardContent>
      </Card>
    </section>

    {/* Skeleton for PrayerGrid */}
    <section className="mb-10">
       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2 pt-4 items-center">
                <Skeleton className="h-7 w-24" />
              </CardHeader>
              <CardContent className="flex justify-center">
                <Skeleton className="h-10 w-28" />
              </CardContent>
            </Card>
          ))}
       </div>
    </section>
    
    {/* Skeleton for Settings */}
    <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-5 w-full mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-5 w-full mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-3/4" />
        </CardContent>
      </Card>
    </section>
  </>
);
