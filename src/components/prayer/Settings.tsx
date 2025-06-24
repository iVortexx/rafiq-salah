
'use client';

import { memo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bell } from 'lucide-react';
import type { PrayerData } from '@/types/prayer';

interface SettingsProps {
  prayerData: PrayerData;
  notificationsEnabled: boolean;
  notificationStatus: 'default' | 'granted' | 'denied';
  onNotificationToggle: (checked: boolean) => Promise<void>;
  translations: any;
}

export const Settings = memo(({
  prayerData,
  notificationsEnabled,
  notificationStatus,
  onNotificationToggle,
  translations: t
}: SettingsProps) => {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="shadow-md">
        <CardHeader>
            <CardTitle className="font-bold">{t.prayerNotifications}</CardTitle>
            <CardDescription>{t.notificationDesc}</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex items-center justify-between">
                <Label htmlFor="notifications" className="flex items-center gap-3 cursor-pointer">
                    <Bell className="w-6 h-6 text-accent"/>
                    <span className="text-lg font-semibold">{t.enableNotifications}</span>
                </Label>
                <Switch 
                  id="notifications" 
                  checked={notificationsEnabled} 
                  onCheckedChange={onNotificationToggle}
                  disabled={notificationStatus === 'denied' || notificationsEnabled}
                  aria-label="Enable prayer notifications" 
                />
            </div>
        </CardContent>
      </Card>
      <Card className="shadow-md">
        <CardHeader>
            <CardTitle className="font-bold">{t.calculationInfo}</CardTitle>
            <CardDescription>{t.calculationMethodDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-lg">
            <span className="font-semibold">{t.method}: </span> 
            {t.methodNames[prayerData.meta.method.name] || prayerData.meta.method.name}
          </p>
        </CardContent>
      </Card>
    </section>
  );
});

Settings.displayName = 'Settings';
