
'use client';
import { useState, useEffect, useMemo } from 'react';
import { useToast } from "@/hooks/use-toast";
import type { PrayerData } from '@/types/prayer';
import { getPrayerList } from '@/lib/time';

export function useNotifications(prayerData: PrayerData | null, language: 'ar' | 'en', t: any) {
  const { toast } = useToast();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<'default' | 'granted' | 'denied'>('default');

  const prayerList = useMemo(() => {
    if (!prayerData) return [];
    const date = new Date(parseInt(prayerData.date.timestamp, 10) * 1000);
    return getPrayerList(prayerData.timings, date, language);
  }, [prayerData, language]);

  useEffect(() => {
    if ('Notification' in window) {
      const status = Notification.permission;
      setNotificationStatus(status);
      if (status === 'granted') {
        setNotificationsEnabled(true);
      }
    }
  }, []);

  useEffect(() => {
      const timeoutIds: NodeJS.Timeout[] = (window as any).prayerNotificationTimeouts || [];
      timeoutIds.forEach(clearTimeout);
      (window as any).prayerNotificationTimeouts = [];
  
      if (notificationsEnabled && prayerList.length > 0 && 'Notification' in window && Notification.permission === 'granted') {
          const now = new Date();
          const newTimeoutIds: NodeJS.Timeout[] = [];
  
          prayerList.forEach(prayer => {
              if (prayer.name === 'Sunrise' || prayer.name === 'Sunset') return;

              const notificationTime = prayer.date.getTime() - 5 * 60 * 1000;
              if (notificationTime > now.getTime()) {
                  const timeoutId = setTimeout(() => {
                      new Notification(t.prayerTimeNow, { 
                        body: t.prayerTimeIn5Mins(prayer.displayName), 
                        dir: language === 'ar' ? 'rtl' : 'ltr'
                      });
                  }, notificationTime - now.getTime());
                  newTimeoutIds.push(timeoutId);
              }
          });
          (window as any).prayerNotificationTimeouts = newTimeoutIds;
      }
  
      return () => {
          const timeoutIdsToClear = (window as any).prayerNotificationTimeouts || [];
          timeoutIdsToClear.forEach(clearTimeout);
      };
  }, [notificationsEnabled, prayerList, language, t]);

  const handleNotificationToggle = async (checked: boolean) => {
    if (!('Notification' in window)) {
        toast({ variant: "destructive", title: t.notificationNotSupported, description: t.notificationNotSupportedDesc });
        return;
    }

    if (notificationStatus === 'denied') {
        toast({ variant: "destructive", title: t.notificationBlocked, description: t.notificationBlockedDesc });
        return;
    }
    
    // If already granted, just enable the state and show a toast.
    if (notificationStatus === 'granted') {
        setNotificationsEnabled(true);
        toast({ title: t.notificationEnabled, description: t.notificationEnabledDesc });
        return;
    }

    // Request permission if not already granted or denied
    if (checked) {
        try {
            const permission = await Notification.requestPermission();
            setNotificationStatus(permission);
            if (permission === 'granted') {
                setNotificationsEnabled(true);
                toast({ title: t.notificationRequestSuccess, description: t.notificationRequestSuccessDesc });
            } else {
                setNotificationsEnabled(false);
                toast({ variant: "destructive", title: t.notificationRequestFailed, description: t.notificationRequestFailedDesc });
            }
        } catch (error) {
            setNotificationsEnabled(false);
            toast({ variant: "destructive", title: t.notificationError, description: t.notificationErrorDesc });
        }
    }
  };
  
  return {
    notificationsEnabled,
    notificationStatus,
    handleNotificationToggle,
  };
}
