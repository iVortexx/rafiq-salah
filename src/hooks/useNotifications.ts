'use client';
import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";

export function useNotifications(t: any) {
  const { toast } = useToast();
  const [notificationStatus, setNotificationStatus] = useState<'default' | 'granted' | 'denied'>('default');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      const permission = Notification.permission;
      setNotificationStatus(permission);
      setNotificationsEnabled(permission === 'granted');
    }
  }, []);

  const handleNotificationToggle = async (checked: boolean) => {
    if (!('Notification' in window)) {
      toast({ variant: "destructive", title: t.notificationNotSupported, description: t.notificationNotSupportedDesc });
      return;
    }

    if (notificationStatus === 'denied') {
      toast({ variant: "destructive", title: t.notificationBlocked, description: t.notificationBlockedDesc });
      return;
    }

    if (checked) {
      const permission = await Notification.requestPermission();
      setNotificationStatus(permission);
      if (permission === 'granted') {
        toast({ title: t.notificationRequestSuccess, description: t.notificationRequestSuccessDesc });
        setNotificationsEnabled(true);
      } else {
        toast({ variant: "destructive", title: t.notificationRequestFailed, description: t.notificationRequestFailedDesc });
        setNotificationsEnabled(false);
      }
    } else {
      setNotificationsEnabled(false);
      toast({ title: t.notificationDisabled, description: t.notificationDisabledDesc });
    }
  };

  return {
    notificationsEnabled,
    notificationStatus,
    handleNotificationToggle,
  };
}
