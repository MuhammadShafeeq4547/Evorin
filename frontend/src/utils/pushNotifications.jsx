export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Notification permission error:', error);
    return false;
  }
};

// Subscribe to push notifications
export const subscribeToPushNotifications = async () => {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Push notifications not supported');
      return false;
    }

    const registration = await navigator.serviceWorker.ready;
    
    // Get VAPID public key from server
    const response = await fetch('/api/push/vapid-public-key');
    const { publicKey } = await response.json();

    if (!publicKey) {
      console.error('No VAPID public key available');
      return false;
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey)
    });

    // Send subscription to server
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription }),
      credentials: 'include'
    });

    return true;
  } catch (error) {
    console.error('Push subscription error:', error);
    return false;
  }
};

// Helper function
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}