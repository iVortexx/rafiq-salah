
'use client';
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { messaging } from '@/lib/firebase';
import { getToken } from 'firebase/messaging';

export function useNotifications(t: any) {
  const { toast } = useToast();
  // `notificationStatus` tracks the browser's permission state ('default', 'granted', 'denied')
  const [notificationStatus, setNotificationStatus] = useState<'default' | 'granted' | 'denied'>('default');
  
  // `notificationsEnabled` reflects if we successfully got a token.
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  
  // TODO: Replace this with your VAPID key from the Firebase console.
  // Go to Project settings > Cloud Messaging > Web configuration > Generate key pair
  const VAPID_KEY = 'YOUR_VAPID_KEY_FROM_FIREBASE';

  // Effect to check initial permission status and get token if already granted.
  useEffect(() => {
    if ('Notification' in window) {
      const permission = Notification.permission;
      setNotificationStatus(permission);
      if (permission === 'granted') {
        // If permission was already granted, we can enable notifications.
        setupFcmToken();
      }
    }
  }, []);

  const setupFcmToken = async () => {
    if (!messaging) {
      console.error("Firebase Messaging is not available.");
      // Don't toast here, it's a dev error.
      return;
    }
    try {
      const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
      if (currentToken) {
        console.log('FCM Token:', currentToken);
        // In a real app, you would send this token to your backend server
        // to associate it with the user.
        // Example: await fetch('/api/save-token', { method: 'POST', body: JSON.stringify({ token: currentToken }) });
        setNotificationsEnabled(true);
      } else {
        // This case means permission is granted but no token is available.
        // This can happen in some browser contexts.
        console.log('No registration token available. A new one may be generated on next permission request.');
        setNotificationsEnabled(false);
      }
    } catch (err) {
      console.error('An error occurred while retrieving FCM token. ', err);
      // The user will see this if their VAPID key is wrong or something else fails.
      toast({ variant: "destructive", title: t.notificationError, description: "Could not get notification token." });
      setNotificationsEnabled(false);
    }
  };

  const handleNotificationToggle = async (checked: boolean) => {
    if (!checked) return; // The switch is disabled when on, so this shouldn't happen.

    if (!('Notification' in window) || !messaging) {
        toast({ variant: "destructive", title: t.notificationNotSupported, description: t.notificationNotSupportedDesc });
        return;
    }

    if (notificationStatus === 'denied') {
        toast({ variant: "destructive", title: t.notificationBlocked, description: t.notificationBlockedDesc });
        return;
    }

    // This will trigger the browser's permission prompt.
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
