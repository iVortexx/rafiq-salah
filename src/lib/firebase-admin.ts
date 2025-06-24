import * as admin from 'firebase-admin';

// Check if the app is already initialized to prevent errors
if (!admin.apps.length) {
  admin.initializeApp({
    // The service account credentials can be automatically discovered
    // by the Firebase Admin SDK when deployed on Google Cloud environments
    // like Firebase App Hosting or Cloud Functions.
    // No need to explicitly pass credential here if the environment is set up correctly.
  });
}

const firestore = admin.firestore();
const auth = admin.auth();
const messagingAdmin = admin.messaging();

export { firestore, auth, messagingAdmin };
