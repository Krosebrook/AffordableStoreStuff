import { useState, useEffect, useCallback } from 'react';
import { WifiOff, Wifi, RefreshCw, CloudOff, Cloud, Download, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useOnlineStatus, useOfflineSync } from '@/hooks/use-offline';
import { cn } from '@/lib/utils';

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();
  const { pendingActions, isSyncing, syncActions, lastSyncTime } = useOfflineSync();
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowBanner(true);
      setDismissed(false);
    } else if (dismissed) {
      setShowBanner(false);
    }
  }, [isOnline, dismissed]);

  if (!showBanner || dismissed) {
    return null;
  }

  return (
    <div 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 px-4 py-3",
        "bg-gradient-to-r from-amber-500/90 to-orange-500/90 backdrop-blur-sm",
        "flex items-center justify-center gap-3 text-white",
        "animate-in slide-in-from-top duration-300"
      )}
      role="alert"
      aria-live="polite"
      data-testid="banner-offline"
    >
      <WifiOff className="w-5 h-5 flex-shrink-0" />
      <span className="text-sm font-medium">
        You're offline. Changes will sync when you reconnect.
      </span>
      {pendingActions > 0 && (
        <Badge variant="secondary" className="bg-white/20 text-white">
          {pendingActions} pending
        </Badge>
      )}
      <Button
        size="icon"
        variant="ghost"
        className="ml-auto"
        onClick={() => setDismissed(true)}
        data-testid="button-dismiss-offline"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}

export function ConnectionStatus() {
  const isOnline = useOnlineStatus();
  const { pendingActions, isSyncing, syncActions } = useOfflineSync();

  return (
    <div 
      className="flex items-center gap-2"
      data-testid="status-connection"
    >
      <div className={cn(
        "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
        isOnline 
          ? "bg-emerald-500/10 text-emerald-500" 
          : "bg-amber-500/10 text-amber-500"
      )}>
        {isOnline ? (
          <>
            <Wifi className="w-3 h-3" />
            <span>Online</span>
          </>
        ) : (
          <>
            <WifiOff className="w-3 h-3" />
            <span>Offline</span>
          </>
        )}
      </div>
      
      {pendingActions > 0 && (
        <Button
          size="sm"
          variant="outline"
          className="text-xs gap-1"
          onClick={syncActions}
          disabled={!isOnline || isSyncing}
          data-testid="button-sync"
        >
          <RefreshCw className={cn("w-3 h-3", isSyncing && "animate-spin")} />
          Sync ({pendingActions})
        </Button>
      )}
    </div>
  );
}

interface SyncStatusProps {
  className?: string;
}

export function SyncStatus({ className }: SyncStatusProps) {
  const isOnline = useOnlineStatus();
  const { pendingActions, isSyncing, lastSyncTime } = useOfflineSync();
  
  const formatTime = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={cn("flex flex-col gap-2 p-3 rounded-lg bg-muted/50", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Sync Status</span>
        {isOnline ? (
          <Cloud className="w-4 h-4 text-emerald-500" />
        ) : (
          <CloudOff className="w-4 h-4 text-amber-500" />
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Upload className="w-3 h-3" />
          <span>{pendingActions} pending</span>
        </div>
        <div className="flex items-center gap-1">
          <RefreshCw className={cn("w-3 h-3", isSyncing && "animate-spin")} />
          <span>{isSyncing ? 'Syncing...' : formatTime(lastSyncTime)}</span>
        </div>
      </div>
    </div>
  );
}

export function UpdatePrompt() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  
  useEffect(() => {
    const handleUpdate = () => setUpdateAvailable(true);
    window.addEventListener('sw-update-available', handleUpdate);
    return () => window.removeEventListener('sw-update-available', handleUpdate);
  }, []);
  
  const handleUpdate = useCallback(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg?.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
          window.location.reload();
        }
      });
    }
  }, []);
  
  if (!updateAvailable) return null;
  
  return (
    <div 
      className={cn(
        "fixed bottom-4 right-4 z-50 p-4 max-w-sm",
        "bg-card border border-border rounded-lg shadow-lg",
        "animate-in slide-in-from-bottom duration-300"
      )}
      data-testid="prompt-update"
    >
      <div className="flex items-start gap-3">
        <Download className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-medium">Update Available</h4>
          <p className="text-xs text-muted-foreground mt-1">
            A new version of FlashFusion is ready.
          </p>
          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              onClick={handleUpdate}
              data-testid="button-update"
            >
              Update Now
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setUpdateAvailable(false)}
              data-testid="button-dismiss-update"
            >
              Later
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
