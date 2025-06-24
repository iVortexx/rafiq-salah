import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getMessaging } from 'firebase-admin/messaging';

// Check if the app is already initialized to prevent errors
if (!getApps().length) {
  initializeApp({
    // The service account credentials can be automatically discovered
    // by the Firebase Admin SDK when deployed on Google Cloud environments
    // like Firebase App Hosting or Cloud Functions.
    // No need to explicitly pass credential here if the environment is set up correctly.
  });
}

const firestore = getFirestore();
const auth = getAuth();
const messagingAdmin = getMessaging();

export { firestore, auth, messagingAdmin };
