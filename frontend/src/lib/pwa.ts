/**
 * PWA initialization and service worker registration
 */

import { initOfflineSupport, syncToServer, isOnline } from './db';

export async function initPWA() {
  if (typeof window === 'undefined') return;

  // Initialize offline database
  await initOfflineSupport();

  // Register service worker
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(
        '/service-worker.js',
        { scope: '/' }
      );

      console.log('✅ Service Worker registered:', registration.scope);

      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              // New service worker available
              console.log('🔄 New version available');
              
              // Show update notification
              if (window.confirm('A new version is available. Update now?')) {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
                window.location.reload();
              }
            }
          });
        }
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'SYNC_REQUIRED') {
          console.log('📤 Sync required:', event.data.tag);
          // Trigger sync in app
          window.dispatchEvent(new CustomEvent('pwa-sync-required'));
        }
      });

      // Check for updates on page load
      registration.update();
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }

  // Listen for online/offline events
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Check initial online status
  if (isOnline()) {
    console.log('🌐 App is online');
  } else {
    console.log('📡 App is offline');
  }
}

function handleOnline() {
  console.log('🌐 Back online!');
  
  // Show notification
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Restaurant POS', {
      body: 'Back online! Syncing your data...',
      icon: '/icon-192.png',
      badge: '/icon-72.png',
    });
  }

  // Trigger sync event
  window.dispatchEvent(new CustomEvent('pwa-online'));
}

function handleOffline() {
  console.log('📡 Gone offline');
  
  // Show notification
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Restaurant POS', {
      body: 'You are offline. Your changes will sync when online.',
      icon: '/icon-192.png',
      badge: '/icon-72.png',
    });
  }

  // Trigger offline event
  window.dispatchEvent(new CustomEvent('pwa-offline'));
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('Notifications not supported');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

/**
 * Show a notification
 */
export function showNotification(title: string, options?: NotificationOptions) {
  if ('Notification' in window && Notification.permission === 'granted') {
    return new Notification(title, {
      icon: '/icon-192.png',
      badge: '/icon-72.png',
      ...options,
    });
  }
}

/**
 * Check if app is installed (standalone mode)
 */
export function isAppInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}

/**
 * Get app install prompt status
 */
export function canInstallApp(): boolean {
  return !isAppInstalled() && typeof window !== 'undefined';
}

/**
 * Register background sync
 */
export async function registerBackgroundSync(tag: string): Promise<void> {
  if ('serviceWorker' in navigator && 'sync' in (self as any).registration) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await (registration as any).sync.register(tag);
      console.log('✅ Background sync registered:', tag);
    } catch (error) {
      console.error('Background sync registration failed:', error);
    }
  }
}

/**
 * Cache data for offline use
 */
export async function cacheDataForOffline(type: string, data: any): Promise<void> {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: type === 'items' ? 'CACHE_ITEMS' : 'CACHE_CATEGORIES',
      [type]: data,
    });
  }
}
