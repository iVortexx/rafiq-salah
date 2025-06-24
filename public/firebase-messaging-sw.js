
// This file needs to be in the public directory.

// Import the Firebase scripts
importScripts("https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js");

// Import the configuration from our dynamic endpoint
importScripts('/firebase-config.js');

// Initialize Firebase
if (self.firebaseConfig) {
  firebase.initializeApp(self.firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log(
      "[firebase-messaging-sw.js] Received background message ",
      payload
    );
    // Customize notification here
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
      body: payload.notification.body,
      icon: "/favicon.ico",
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
} else {
    console.error("Firebase config not loaded in service worker. Notifications will not work.");
}
