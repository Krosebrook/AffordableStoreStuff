const DB_NAME = 'flashfusion-db';
const DB_VERSION = 1;

interface OfflineAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  endpoint: string;
  data: unknown;
  timestamp: number;
  retries: number;
}

interface CachedData {
  key: string;
  data: unknown;
  timestamp: number;
  ttl: number;
}

let dbInstance: IDBDatabase | null = null;

export async function openDB(): Promise<IDBDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('[IndexedDB] Failed to open database:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains('offlineActions')) {
        const offlineStore = db.createObjectStore('offlineActions', { keyPath: 'id' });
        offlineStore.createIndex('timestamp', 'timestamp', { unique: false });
        offlineStore.createIndex('type', 'type', { unique: false });
      }

      if (!db.objectStoreNames.contains('cachedData')) {
        const cacheStore = db.createObjectStore('cachedData', { keyPath: 'key' });
        cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      if (!db.objectStoreNames.contains('drafts')) {
        const draftsStore = db.createObjectStore('drafts', { keyPath: 'id' });
        draftsStore.createIndex('type', 'type', { unique: false });
        draftsStore.createIndex('updatedAt', 'updatedAt', { unique: false });
      }

      if (!db.objectStoreNames.contains('uploads')) {
        const uploadsStore = db.createObjectStore('uploads', { keyPath: 'id' });
        uploadsStore.createIndex('status', 'status', { unique: false });
        uploadsStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      if (!db.objectStoreNames.contains('downloads')) {
        const downloadsStore = db.createObjectStore('downloads', { keyPath: 'id' });
        downloadsStore.createIndex('status', 'status', { unique: false });
      }

      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    };
  });
}

export async function addOfflineAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'retries'>): Promise<string> {
  const db = await openDB();
  const id = `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['offlineActions'], 'readwrite');
    const store = transaction.objectStore('offlineActions');
    
    const fullAction: OfflineAction = {
      ...action,
      id,
      timestamp: Date.now(),
      retries: 0
    };
    
    const request = store.add(fullAction);
    request.onsuccess = () => resolve(id);
    request.onerror = () => reject(request.error);
  });
}

export async function getOfflineActions(): Promise<OfflineAction[]> {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['offlineActions'], 'readonly');
    const store = transaction.objectStore('offlineActions');
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function removeOfflineAction(id: string): Promise<void> {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['offlineActions'], 'readwrite');
    const store = transaction.objectStore('offlineActions');
    const request = store.delete(id);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function setCachedData(key: string, data: unknown, ttlMs: number = 5 * 60 * 1000): Promise<void> {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['cachedData'], 'readwrite');
    const store = transaction.objectStore('cachedData');
    
    const cacheEntry: CachedData = {
      key,
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    };
    
    const request = store.put(cacheEntry);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getCachedData<T>(key: string): Promise<T | null> {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['cachedData'], 'readonly');
    const store = transaction.objectStore('cachedData');
    const request = store.get(key);
    
    request.onsuccess = () => {
      const result = request.result as CachedData | undefined;
      if (!result) {
        resolve(null);
        return;
      }
      
      const isExpired = Date.now() - result.timestamp > result.ttl;
      if (isExpired) {
        deleteCachedData(key);
        resolve(null);
        return;
      }
      
      resolve(result.data as T);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function deleteCachedData(key: string): Promise<void> {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['cachedData'], 'readwrite');
    const store = transaction.objectStore('cachedData');
    const request = store.delete(key);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function clearExpiredCache(): Promise<void> {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['cachedData'], 'readwrite');
    const store = transaction.objectStore('cachedData');
    const request = store.openCursor();
    
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        const entry = cursor.value as CachedData;
        const isExpired = Date.now() - entry.timestamp > entry.ttl;
        if (isExpired) {
          cursor.delete();
        }
        cursor.continue();
      } else {
        resolve();
      }
    };
    request.onerror = () => reject(request.error);
  });
}

interface Draft {
  id: string;
  type: string;
  data: unknown;
  updatedAt: number;
}

export async function saveDraft(type: string, data: unknown): Promise<string> {
  const db = await openDB();
  const id = `draft_${type}_${Date.now()}`;
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['drafts'], 'readwrite');
    const store = transaction.objectStore('drafts');
    
    const draft: Draft = {
      id,
      type,
      data,
      updatedAt: Date.now()
    };
    
    const request = store.put(draft);
    request.onsuccess = () => resolve(id);
    request.onerror = () => reject(request.error);
  });
}

export async function getDrafts(type?: string): Promise<Draft[]> {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['drafts'], 'readonly');
    const store = transaction.objectStore('drafts');
    
    if (type) {
      const index = store.index('type');
      const request = index.getAll(type);
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    } else {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    }
  });
}

export async function deleteDraft(id: string): Promise<void> {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['drafts'], 'readwrite');
    const store = transaction.objectStore('drafts');
    const request = store.delete(id);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

interface UploadEntry {
  id: string;
  file: Blob;
  filename: string;
  type: string;
  size: number;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  progress: number;
  endpoint: string;
  createdAt: number;
  error?: string;
}

export async function queueUpload(file: File, endpoint: string): Promise<string> {
  const db = await openDB();
  const id = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['uploads'], 'readwrite');
    const store = transaction.objectStore('uploads');
    
    const entry: UploadEntry = {
      id,
      file: file,
      filename: file.name,
      type: file.type,
      size: file.size,
      status: 'pending',
      progress: 0,
      endpoint,
      createdAt: Date.now()
    };
    
    const request = store.add(entry);
    request.onsuccess = () => resolve(id);
    request.onerror = () => reject(request.error);
  });
}

export async function getPendingUploads(): Promise<UploadEntry[]> {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['uploads'], 'readonly');
    const store = transaction.objectStore('uploads');
    const index = store.index('status');
    const request = index.getAll('pending');
    
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function updateUploadStatus(
  id: string, 
  status: UploadEntry['status'], 
  progress?: number,
  error?: string
): Promise<void> {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['uploads'], 'readwrite');
    const store = transaction.objectStore('uploads');
    const getRequest = store.get(id);
    
    getRequest.onsuccess = () => {
      const entry = getRequest.result as UploadEntry;
      if (entry) {
        entry.status = status;
        if (progress !== undefined) entry.progress = progress;
        if (error !== undefined) entry.error = error;
        
        const putRequest = store.put(entry);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      } else {
        resolve();
      }
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
}

interface DownloadEntry {
  id: string;
  url: string;
  filename: string;
  blob?: Blob;
  status: 'pending' | 'downloading' | 'completed' | 'failed';
  progress: number;
  createdAt: number;
  error?: string;
}

export async function queueDownload(url: string, filename: string): Promise<string> {
  const db = await openDB();
  const id = `download_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['downloads'], 'readwrite');
    const store = transaction.objectStore('downloads');
    
    const entry: DownloadEntry = {
      id,
      url,
      filename,
      status: 'pending',
      progress: 0,
      createdAt: Date.now()
    };
    
    const request = store.add(entry);
    request.onsuccess = () => resolve(id);
    request.onerror = () => reject(request.error);
  });
}

export async function getDownloads(): Promise<DownloadEntry[]> {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['downloads'], 'readonly');
    const store = transaction.objectStore('downloads');
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function setSetting(key: string, value: unknown): Promise<void> {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['settings'], 'readwrite');
    const store = transaction.objectStore('settings');
    const request = store.put({ key, value });
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getSetting<T>(key: string): Promise<T | null> {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['settings'], 'readonly');
    const store = transaction.objectStore('settings');
    const request = store.get(key);
    
    request.onsuccess = () => {
      resolve(request.result?.value ?? null);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function clearAllData(): Promise<void> {
  const db = await openDB();
  const storeNames = ['offlineActions', 'cachedData', 'drafts', 'uploads', 'downloads', 'settings'];
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeNames, 'readwrite');
    
    storeNames.forEach((storeName) => {
      transaction.objectStore(storeName).clear();
    });
    
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}
