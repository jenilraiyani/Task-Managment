import api from './api';

const PUBLIC_VAPID_KEY = 'BJmZycy_-NXsAPeFirCtNsSfj3WzhJE_R5sUb5HMIUnsIaRwMw10nKYumxviVxoM5f0Mtgk-uygZ4MYYxQUTQNk';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const subscribeToPushNotifications = async () => {
  if (!('serviceWorker' in navigator)) return null;
  if (!('PushManager' in window)) return null;

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });
    console.log('Service Worker Registered');

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Push notification permission denied');
      return null;
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
    });

    console.log('Push Registered...');

    // Send Push Subscription to Backend
    await api.post('/users/push/subscribe', { subscription });
    console.log('Push Sent to Server');
    return subscription;
  } catch (error) {
    console.error('Error during push subscription:', error);
    return null;
  }
};
