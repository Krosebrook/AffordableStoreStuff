export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;

export function initPWA() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    window.dispatchEvent(new CustomEvent('pwa-installable'));
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    console.log('[PWA] App installed');
    window.dispatchEvent(new CustomEvent('pwa-installed'));
  });
}

export function canInstallPWA(): boolean {
  return deferredPrompt !== null;
}

export async function installPWA(): Promise<boolean> {
  if (!deferredPrompt) {
    return false;
  }

  await deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  
  deferredPrompt = null;
  
  return outcome === 'accepted';
}

export function isPWAInstalled(): boolean {
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }
  
  if ((window.navigator as any).standalone === true) {
    return true;
  }
  
  return false;
}

export function registerPeriodicSync(tag: string, minInterval: number) {
  if ('serviceWorker' in navigator && 'periodicSync' in window) {
    navigator.serviceWorker.ready.then(async (registration: any) => {
      try {
        await registration.periodicSync.register(tag, {
          minInterval
        });
        console.log(`[PWA] Periodic sync registered: ${tag}`);
      } catch (error) {
        console.log('[PWA] Periodic sync not supported');
      }
    });
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    let subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      return subscription;
    }

    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        import.meta.env.VITE_VAPID_PUBLIC_KEY || ''
      )
    });

    return subscription;
  } catch (error) {
    console.error('[PWA] Push subscription failed:', error);
    return null;
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

export function getCacheStorageUsage(): Promise<{ usage: number; quota: number } | null> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    return navigator.storage.estimate().then((estimate) => ({
      usage: estimate.usage || 0,
      quota: estimate.quota || 0
    }));
  }
  return Promise.resolve(null);
}

export async function clearServiceWorkerCaches(): Promise<void> {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    registration.active?.postMessage({ type: 'CLEAR_CACHE' });
  }
}

export function getNetworkStatus(): {
  type: string;
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
} {
  const connection = (navigator as any).connection || 
                     (navigator as any).mozConnection || 
                     (navigator as any).webkitConnection;

  if (!connection) {
    return {
      type: 'unknown',
      effectiveType: 'unknown',
      downlink: 0,
      rtt: 0,
      saveData: false
    };
  }

  return {
    type: connection.type || 'unknown',
    effectiveType: connection.effectiveType || 'unknown',
    downlink: connection.downlink || 0,
    rtt: connection.rtt || 0,
    saveData: connection.saveData || false
  };
}

export function useNetworkQuality(): 'high' | 'medium' | 'low' {
  const { effectiveType, saveData } = getNetworkStatus();
  
  if (saveData) return 'low';
  
  switch (effectiveType) {
    case '4g':
      return 'high';
    case '3g':
      return 'medium';
    case '2g':
    case 'slow-2g':
      return 'low';
    default:
      return 'medium';
  }
}
