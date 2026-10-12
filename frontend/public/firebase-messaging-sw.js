importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

// These values must match your Firebase project config.
// Get them from Firebase Console > Project Settings > General > Your apps.
firebase.initializeApp({
  apiKey: 'AIzaSyBU2MBF9tB0u9CBNtCg3IYkZxCcdc2vuIw',
  authDomain: 'cafeterria-app.firebaseapp.com',
  projectId: 'cafeterria-app',
  storageBucket: 'cafeterria-app.firebasestorage.app',
  messagingSenderId: '601231496429',
  appId: '1:601231496429:web:19993d5602e1744915a8e4',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification;
  self.registration.showNotification(title, {
    body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'order-ready',
    requireInteraction: true,  // stays on screen until dismissed
    renotify: true,            // re-rings even if a notification with this tag already exists
    vibrate: [300, 100, 300, 100, 300],  // vibration pattern for Android
    silent: false,
  });
});
