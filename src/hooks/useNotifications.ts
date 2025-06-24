
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { messaging } from '@/lib/firebase';
import { getToken } from 'firebase/messaging';

export function useNotifications(t: any, location: string, language: 'ar' | 'en') {
  const { toast } = useToast();
  const [notificationStatus, setNotificationStatus] = useState<'default' | 'granted' | 'denied'>('default');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  
  const VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_KEY;

  const setupFcmToken = useCallback(async () => {
    if (!messaging || !VAPID_KEY) {
      console.error("Firebase Messaging or VAPID key is not configured in .env.local");
      return;
    }
    if (!location || !language) {
      // Don't try to get a token if we don't have location info yet
      return;
    }
    try {
      const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
      if (currentToken) {
        console.log('FCM Token:', currentToken);
        // Send this token to your backend server to trigger notifications.
        await fetch('/api/save-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: currentToken, location, language }),
        });
        setNotificationsEnabled(true);
      } else {
        console.log('No registration token available. A new one may be generated on next permission request.');
        setNotificationsEnabled(false);
      }
    } catch (err) {
      console.error('An error occurred while retrieving FCM token. ', err);
      toast({ variant: "destructive", title: t.notificationError, description: t.notificationErrorDesc });
      setNotificationsEnabled(false);
    }
  }, [VAPID_KEY, location, language, t, toast]);

  useEffect(() => {
    if ('Notification' in window) {
      const permission = Notification.permission;
      setNotificationStatus(permission);
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        // We call setupFcmToken here, and it will only proceed if location is available.
        setupFcmToken();
      }
    }
  }, [setupFcmToken]);


  const handleNotificationToggle = async (checked: boolean) => {
    if (!checked) {
        // Here you might want to call a backend endpoint to delete the token
        // For simplicity, we'll just disable it on the client
        setNotificationsEnabled(false);
        toast({ title: t.notificationDisabled, description: t.notificationDisabledDesc });
        return;
    }

    if (!('Notification' in window) || !messaging) {
        toast({ variant: "destructive", title: t.notificationNotSupported, description: t.notificationNotSupportedDesc });
        return;
    }
    
    if (!VAPID_KEY) {
      toast({ variant: "destructive", title: "Configuration Error", description: "VAPID key is not set. Please configure it in your environment variables." });
      return;
    }

    // Allow re-requesting/re-registering even if already granted,
    // to update location or other details on the backend.
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
