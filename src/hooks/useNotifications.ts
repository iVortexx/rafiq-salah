
'use client';
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { messaging } from '@/lib/firebase';
import { getToken } from 'firebase/messaging';

export function useNotifications(t: any) {
  const { toast } = useToast();
  const [notificationStatus, setNotificationStatus] = useState<'default' | 'granted' | 'denied'>('default');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  
  const VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_KEY;

  useEffect(() => {
    if ('Notification' in window) {
      const permission = Notification.permission;
      setNotificationStatus(permission);
      if (permission === 'granted') {
        setupFcmToken();
      }
    }
  }, []);

  const setupFcmToken = async () => {
    if (!messaging || !VAPID_KEY) {
      console.error("Firebase Messaging or VAPID key is not configured in .env.local");
      return;
    }
    try {
      const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
      if (currentToken) {
        console.log('FCM Token:', currentToken);
        // TODO: Send this token to your backend server to trigger notifications.
        setNotificationsEnabled(true);
      } else {
        console.log('No registration token available. A new one may be generated on next permission request.');
        setNotificationsEnabled(false);
      }
    } catch (err) {
      console.error('An error occurred while retrieving FCM token. ', err);
      toast({ variant: "destructive", title: t.notificationError, description: "Could not get notification token. Ensure your VAPID key is correct." });
      setNotificationsEnabled(false);
    }
  };

  const handleNotificationToggle = async (checked: boolean) => {
    if (!checked) return;

    if (!('Notification' in window) || !messaging) {
        toast({ variant: "destructive", title: t.notificationNotSupported, description: t.notificationNotSupportedDesc });
        return;
    }
    
    if (!VAPID_KEY) {
      toast({ variant: "destructive", title: "Configuration Error", description: "VAPID key is not set. Please configure it in your environment variables." });
      return;
    }

    if (notificationStatus === 'denied') {
        toast({ variant: "destructive", title: t.notificationBlocked, description: t.notificationBlockedDesc });
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
  };
  
  return {
    notificationsEnabled,
    notificationStatus,
    handleNotificationToggle,
  };
}
