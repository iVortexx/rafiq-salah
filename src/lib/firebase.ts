
'use client';

import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

// TODO: Replace this with your own Firebase configuration from the Firebase Console!
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

export { app, messaging };
