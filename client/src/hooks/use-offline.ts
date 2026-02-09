import { useState, useEffect, useCallback } from 'react';
import { 
  addOfflineAction, 
  getOfflineActions, 
  removeOfflineAction,
  getCachedData,
  setCachedData
} from '@/lib/indexed-db';
import { apiRequest } from '@/lib/queryClient';

interface OfflineState {
  isOnline: boolean;
  pendingActions: number;
  isSyncing: boolean;
  lastSyncTime: Date | null;
}

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

export function useOfflineSync() {
  const isOnline = useOnlineStatus();
  const [state, setState] = useState<OfflineState>({
    isOnline: true,
    pendingActions: 0,
    isSyncing: false,
    lastSyncTime: null
  });

  const updatePendingCount = useCallback(async () => {
    try {
      const actions = await getOfflineActions();
      setState(prev => ({ ...prev, pendingActions: actions.length }));
    } catch (error) {
      console.error('[OfflineSync] Failed to get pending actions:', error);
    }
  }, []);

  const syncActions = useCallback(async () => {
    if (!navigator.onLine || state.isSyncing) return;

    setState(prev => ({ ...prev, isSyncing: true }));

    try {
      const actions = await getOfflineActions();
      
      for (const action of actions) {
        try {
          const method = action.type === 'delete' ? 'DELETE' : 
                        action.type === 'update' ? 'PATCH' : 'POST';
          
          await apiRequest(method, action.endpoint, action.data);
          await removeOfflineAction(action.id);
        } catch (error) {
          console.error(`[OfflineSync] Failed to sync action ${action.id}:`, error);
        }
      }

      setState(prev => ({
        ...prev,
        isSyncing: false,
        lastSyncTime: new Date(),
        pendingActions: 0
      }));
    } catch (error) {
      console.error('[OfflineSync] Sync failed:', error);
      setState(prev => ({ ...prev, isSyncing: false }));
    }
  }, [state.isSyncing]);

  useEffect(() => {
    setState(prev => ({ ...prev, isOnline }));
    
    if (isOnline) {
      syncActions();
    }
  }, [isOnline, syncActions]);

  useEffect(() => {
    updatePendingCount();
    const interval = setInterval(updatePendingCount, 30000);
    return () => clearInterval(interval);
  }, [updatePendingCount]);

  const queueAction = useCallback(async (
    type: 'create' | 'update' | 'delete',
    endpoint: string,
    data?: unknown
  ) => {
    if (navigator.onLine) {
      const method = type === 'delete' ? 'DELETE' : 
                    type === 'update' ? 'PATCH' : 'POST';
      return apiRequest(method, endpoint, data);
    }

    await addOfflineAction({ type, endpoint, data });
    await updatePendingCount();
    
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      try {
        await (navigator.serviceWorker.ready as Promise<ServiceWorkerRegistration>)
          .then(reg => (reg as any).sync?.register('sync-offline-actions'));
      } catch (e) {
        console.log('[OfflineSync] Background sync not supported');
      }
    }
    
    return { queued: true };
  }, [updatePendingCount]);

  return {
    ...state,
    queueAction,
    syncActions,
    updatePendingCount
  };
}

export function useOfflineData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number = 5 * 60 * 1000
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);
  const isOnline = useOnlineStatus();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const cached = await getCachedData<T>(key);
      
      if (cached) {
        setData(cached);
        setIsFromCache(true);
        
        if (!isOnline) {
          setIsLoading(false);
          return;
        }
      }

      if (isOnline) {
        const freshData = await fetcher();
        setData(freshData);
        setIsFromCache(false);
        await setCachedData(key, freshData, ttlMs);
      } else if (!cached) {
        throw new Error('No cached data available offline');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch data'));
    } finally {
      setIsLoading(false);
    }
  }, [key, fetcher, ttlMs, isOnline]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = useCallback(async () => {
    if (!isOnline) return;
    await fetchData();
  }, [isOnline, fetchData]);

  return { data, isLoading, error, isFromCache, refresh };
}
