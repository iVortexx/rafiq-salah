
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { messaging } from '@/lib/firebase';
import { getToken, deleteToken } from 'firebase/messaging';

export function useNotifications(t: any, location: string, language: 'ar' | 'en') {
  const { toast } = useToast();
  const [notificationStatus, setNotificationStatus] = useState<'default' | 'granted' | 'denied'>('default');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  
  const VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_KEY;

  const setupFcmToken = useCallback(async () => {
    if (!messaging || !VAPID_KEY) {
      console.error("Firebase Messaging or VAPID key is not configured.");
      return;
    }
    if (!location || !language) return;

    try {
      const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
      if (currentToken) {
        await fetch('/api/save-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: currentToken, location, language }),
        });
        setNotificationsEnabled(true);
      } else {
        console.log('No registration token available.');
        setNotificationsEnabled(false);
      }
    } catch (err) {
      console.error('An error occurred while retrieving FCM token. ', err);
      toast({ variant: "destructive", title: t.notificationError, description: t.notificationErrorDesc });
      setNotificationsEnabled(false);
    }
  }, [VAPID_KEY, location, language, t, toast]);
  
  const disableNotifications = async () => {
    if (!messaging || !VAPID_KEY) return;
    try {
        const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
        if (currentToken) {
            await fetch('/api/delete-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: currentToken }),
            });
            await deleteToken(messaging);
        }
        setNotificationsEnabled(false);
        toast({ title: t.notificationDisabled, description: t.notificationDisabledDesc });
    } catch (err) {
        console.error('An error occurred while deleting FCM token. ', err);
        toast({ variant: "destructive", title: t.notificationError, description: "Failed to disable notifications." });
    }
  };

  useEffect(() => {
    if ('Notification' in window) {
      const permission = Notification.permission;
      setNotificationStatus(permission);
      if (permission === 'granted') {
        setupFcmToken();
      }
    }
  }, [setupFcmToken]);

  const handleNotificationToggle = async (checked: boolean) => {
    if (!('Notification' in window) || !messaging) {
        toast({ variant: "destructive", title: t.notificationNotSupported, description: t.notificationNotSupportedDesc });
        return;
    }

    if (notificationStatus === 'denied') {
        toast({ variant: "destructive", title: t.notificationBlocked, description: t.notificationBlockedDesc });
        return;
    }

    if (checked) {
        if (!VAPID_KEY) {
          toast({ variant: "destructive", title: "Configuration Error", description: "VAPID key is not set." });
          return;
        }
        const permission = await Notification.requestPermission();
        setNotificationStatus(permission);
        if (permission === 'granted') {
          toast({ title: t.notificationRequestSuccess, description: t.notificationRequestSuccessDesc });
          await setupFcmToken();
        } else {
          toast({ variant: "destructive", title: t.notificationRequestFailed, description: t.notificationRequestFailedDesc });
          setNotificationsEnabled(false);
        }
    } else {
        await disableNotifications();
    }
  };
  
  return {
    notificationsEnabled,
    notificationStatus,
    handleNotificationToggle,
  };
}
