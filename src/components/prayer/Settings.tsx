'use client';

import { memo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Bell, Chrome, ExternalLink } from 'lucide-react';
import type { PrayerData } from '@/types/prayer';

const CHROME_EXTENSION_URL = "https://chromewebstore.google.com/detail/afcbeklnhcpfeokpdjgmlnlnemejajgc?utm_source=item-share-cb";

interface SettingsProps {
  prayerData: PrayerData;
  translations: any;
}

export const Settings = memo(({
  prayerData,
  translations: t
}: SettingsProps) => {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Extension Reminders Card (Replaces the browser notifications switch) */}
      <Card className="shadow-md bg-card border-border">
        <CardHeader>
            <CardTitle className="font-bold flex items-center gap-2">
              <Bell className="w-5 h-5 text-accent" />
              <span>{t.prayerNotifications || "إشعارات الصلاة"}</span>
            </CardTitle>
            <CardDescription>
              {t.notificationsViaExtensionDesc || "لتلقي تنبيهات وإشعارات الأذان في وقتها بدقة أثناء التصفح، يمكنك تثبيت إضافة رفيق الصلاة لمتصفح Chrome."}
            </CardDescription>
        </CardHeader>
        <CardContent>
            <a
              href={CHROME_EXTENSION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-accent text-accent-foreground font-bold hover:brightness-105 transition shadow-sm text-sm"
            >
              <Chrome className="w-4 h-4" />
              <span>{t.addToChrome || "أضف رفيق الصلاة إلى Chrome لتفعيل التذكيرات"}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
        </CardContent>
      </Card>

      {/* Calculation Info Card (Exact original) */}
      <Card className="shadow-md bg-card border-border">
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
