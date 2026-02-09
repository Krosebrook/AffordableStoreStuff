import { vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/lib/theme-provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

interface TestWrapperProps {
  children: React.ReactNode;
  queryClient?: QueryClient;
}

export function TestWrapper({ children, queryClient }: TestWrapperProps) {
  const client = queryClient || createTestQueryClient();
  
  return (
    <QueryClientProvider client={client}>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          {children}
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export function mockFetch(responses: Record<string, unknown>) {
  const originalFetch = global.fetch;
  
  global.fetch = vi.fn().mockImplementation((url: string) => {
    const response = responses[url];
    
    if (response) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(response),
        text: () => Promise.resolve(JSON.stringify(response)),
      });
    }
    
    return Promise.resolve({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ error: 'Not found' }),
    });
  });
  
  return () => {
    global.fetch = originalFetch;
  };
}

export function mockIndexedDB() {
  const data: Record<string, Record<string, unknown>> = {};
  
  const mockStore = (storeName: string) => ({
    put: vi.fn((value: { key?: string; id?: string }) => {
      const key = value.key || value.id || Math.random().toString();
      if (!data[storeName]) data[storeName] = {};
      data[storeName][key] = value;
      return { onsuccess: null, onerror: null };
    }),
    get: vi.fn((key: string) => ({
      result: data[storeName]?.[key],
      onsuccess: null,
      onerror: null,
    })),
    getAll: vi.fn(() => ({
      result: data[storeName] ? Object.values(data[storeName]) : [],
      onsuccess: null,
      onerror: null,
    })),
    delete: vi.fn((key: string) => {
      if (data[storeName]) delete data[storeName][key];
      return { onsuccess: null, onerror: null };
    }),
    clear: vi.fn(() => {
      data[storeName] = {};
      return { onsuccess: null, onerror: null };
    }),
  });

  const mockDB = {
    objectStoreNames: { contains: () => false },
    createObjectStore: vi.fn(() => ({
      createIndex: vi.fn(),
    })),
    transaction: vi.fn(() => ({
      objectStore: mockStore,
      oncomplete: null,
      onerror: null,
    })),
  };

  (global as any).indexedDB = {
    open: vi.fn(() => ({
      result: mockDB,
      onsuccess: null,
      onerror: null,
      onupgradeneeded: null,
    })),
  };

  return data;
}

export function mockServiceWorker() {
  const listeners: Record<string, Set<(event: any) => void>> = {};
  
  const mockRegistration = {
    installing: null,
    waiting: null,
    active: {
      postMessage: vi.fn(),
    },
    addEventListener: vi.fn((event: string, handler: (event: any) => void) => {
      if (!listeners[event]) listeners[event] = new Set();
      listeners[event].add(handler);
    }),
    pushManager: {
      getSubscription: vi.fn(() => Promise.resolve(null)),
      subscribe: vi.fn(() => Promise.resolve({ endpoint: 'test' })),
    },
    sync: {
      register: vi.fn(() => Promise.resolve()),
    },
  };

  (navigator as any).serviceWorker = {
    ready: Promise.resolve(mockRegistration),
    register: vi.fn(() => Promise.resolve(mockRegistration)),
    addEventListener: vi.fn(),
    controller: { postMessage: vi.fn() },
    getRegistration: vi.fn(() => Promise.resolve(mockRegistration)),
  };

  return mockRegistration;
}

export function mockOnlineStatus(isOnline: boolean) {
  Object.defineProperty(navigator, 'onLine', {
    value: isOnline,
    writable: true,
    configurable: true,
  });
}

export async function waitForElement(
  selector: string,
  timeout: number = 5000
): Promise<Element | null> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const check = () => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }
      
      if (Date.now() - startTime > timeout) {
        resolve(null);
        return;
      }
      
      requestAnimationFrame(check);
    };
    
    check();
  });
}

export function createMockEvent<T extends Event>(
  type: string,
  properties: Partial<T> = {}
): T {
  const event = new Event(type) as T;
  Object.assign(event, properties);
  return event;
}

export function simulateOffline() {
  mockOnlineStatus(false);
  window.dispatchEvent(new Event('offline'));
}

export function simulateOnline() {
  mockOnlineStatus(true);
  window.dispatchEvent(new Event('online'));
}
