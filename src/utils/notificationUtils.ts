
// Check if Browser Supports Notifications
export const checkNotificationSupport = () => {
  return 'Notification' in window;
};

// Request Notification Permission
export const requestNotificationPermission = async () => {
  if (!checkNotificationSupport()) {
    return false;
  }
  
  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

// Check if Push API is supported
export const isPushSupported = () => {
  return 'PushManager' in window;
};

// Subscribe to Push Notifications
export const subscribeToPushNotifications = async () => {
  if (!isPushSupported()) {
    return null;
  }
  
  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Get subscription
    let subscription = await registration.pushManager.getSubscription();
    
    // If a subscription exists, return it
    if (subscription) {
      return subscription;
    }
    
    // Create new subscription
    // In a real app, you would send these keys from your server
    const vapidPublicKey = 'REPLACE_WITH_YOUR_PUBLIC_VAPID_KEY';
    
    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
    
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey
    });
    
    // Send subscription to server
    // await sendSubscriptionToServer(subscription);
    
    return subscription;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return null;
  }
};

// Helper function to convert base64 to Uint8Array
function urlBase64ToUint8Array(base64String: string) {
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

// Simulate sending a notification (for demo purposes)
export const sendTestNotification = () => {
  if (checkNotificationSupport() && Notification.permission === 'granted') {
    const notification = new Notification('MeetingMaster Notification', {
      body: 'This is a test notification from MeetingMaster',
      icon: '/favicon.ico'
    });
    
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }
};
