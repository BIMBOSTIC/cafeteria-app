import { getToken, onMessage } from 'firebase/messaging';
import { getMessagingInstance } from '../config/firebase';
import api from './api';

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

export const registerFCMToken = async () => {
  try {
    if (!('Notification' in window)) {
      console.warn('[FCM] Browser does not support notifications');
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('[FCM] Notification permission denied — push alerts will not work');
      return;
    }

    const messaging = await getMessagingInstance();
    if (!messaging) {
      console.warn('[FCM] Messaging not supported in this browser');
      return;
    }

    // Explicitly register the service worker so Firebase uses the correct one
    // on mobile Chrome (otherwise it may fail to find it)
    const swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    await navigator.serviceWorker.ready;

    const token = await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: swRegistration });
    if (!token) {
      console.warn('[FCM] No token returned — service worker may not be registered');
      return;
    }

    await api.post('/auth/register-fcm-token', { fcmToken: token });
    console.info('[FCM] Token registered successfully');
  } catch (error) {
    console.error('[FCM] Failed to register token:', error);
  }
};

export const onForegroundMessage = async (callback) => {
  const messaging = await getMessagingInstance();
  if (!messaging) return () => {};
  return onMessage(messaging, callback);
};
