import { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, Download, X, Check, AlertCircle, FileIcon, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useOnlineStatus } from '@/hooks/use-offline';
import { 
  queueUpload, 
  getPendingUploads, 
  updateUploadStatus,
  queueDownload,
  getDownloads
} from '@/lib/indexed-db';
import { cn } from '@/lib/utils';

interface UploadItem {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  error?: string;
}

interface DownloadItem {
  id: string;
  filename: string;
  url: string;
  progress: number;
  status: 'pending' | 'downloading' | 'completed' | 'failed';
  error?: string;
}

interface FileUploadProps {
  endpoint: string;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  onUploadComplete?: (files: { id: string; url: string }[]) => void;
  className?: string;
}

export function FileUpload({
  endpoint,
  accept = '*',
  multiple = false,
  maxSize = 10 * 1024 * 1024,
  onUploadComplete,
  className
}: FileUploadProps) {
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isOnline = useOnlineStatus();
  const { toast } = useToast();

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const validFiles: File[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (file.size > maxSize) {
        toast({
          title: 'File too large',
          description: `${file.name} exceeds the maximum size of ${Math.round(maxSize / 1024 / 1024)}MB`,
          variant: 'destructive'
        });
        continue;
      }
      
      validFiles.push(file);
    }

    const newUploads: UploadItem[] = validFiles.map((file) => ({
      id: `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      file,
      progress: 0,
      status: 'pending' as const
    }));

    setUploads(prev => [...prev, ...newUploads]);

    for (const upload of newUploads) {
      if (!isOnline) {
        await queueUpload(upload.file, endpoint);
        setUploads(prev =>
          prev.map(u =>
            u.id === upload.id
              ? { ...u, status: 'pending' as const, progress: 0 }
              : u
          )
        );
        toast({
          title: 'Queued for upload',
          description: `${upload.file.name} will be uploaded when you're back online`
        });
        continue;
      }

      try {
        setUploads(prev =>
          prev.map(u =>
            u.id === upload.id ? { ...u, status: 'uploading' as const } : u
          )
        );

        const formData = new FormData();
        formData.append('file', upload.file);

        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            setUploads(prev =>
              prev.map(u =>
                u.id === upload.id ? { ...u, progress } : u
              )
            );
          }
        });

        await new Promise<{ id: string; url: string }>((resolve, reject) => {
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const response = JSON.parse(xhr.responseText);
                resolve(response);
              } catch {
                resolve({ id: upload.id, url: '' });
              }
            } else {
              reject(new Error(`Upload failed: ${xhr.statusText}`));
            }
          };
          xhr.onerror = () => reject(new Error('Network error'));
          xhr.open('POST', endpoint);
          xhr.send(formData);
        });

        setUploads(prev =>
          prev.map(u =>
            u.id === upload.id
              ? { ...u, status: 'completed' as const, progress: 100 }
              : u
          )
        );
      } catch (error) {
        setUploads(prev =>
          prev.map(u =>
            u.id === upload.id
              ? { 
                  ...u, 
                  status: 'failed' as const, 
                  error: error instanceof Error ? error.message : 'Upload failed' 
                }
              : u
          )
        );
      }
    }

    const completedUploads = newUploads.filter(u => 
      uploads.find(up => up.id === u.id)?.status === 'completed'
    );
    
    if (completedUploads.length > 0 && onUploadComplete) {
      onUploadComplete(completedUploads.map(u => ({ id: u.id, url: '' })));
    }
  }, [endpoint, maxSize, isOnline, toast, onUploadComplete, uploads]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const removeUpload = useCallback((id: string) => {
    setUploads(prev => prev.filter(u => u.id !== id));
  }, []);

  return (
    <div className={cn("space-y-4", className)}>
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50",
          !isOnline && "opacity-75"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        data-testid="dropzone-upload"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          data-testid="input-file"
        />
        <Upload className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
        <p className="text-sm font-medium">
          Drop files here or click to upload
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Max size: {Math.round(maxSize / 1024 / 1024)}MB
          {!isOnline && ' (Files will be queued for upload when online)'}
        </p>
      </div>

      {uploads.length > 0 && (
        <div className="space-y-2">
          {uploads.map((upload) => (
            <div
              key={upload.id}
              className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
              data-testid={`upload-item-${upload.id}`}
            >
              <FileIcon className="w-8 h-8 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{upload.file.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  {upload.status === 'uploading' && (
                    <Progress value={upload.progress} className="h-1 flex-1" />
                  )}
                  {upload.status === 'completed' && (
                    <Badge variant="secondary" className="text-emerald-500">
                      <Check className="w-3 h-3 mr-1" />
                      Uploaded
                    </Badge>
                  )}
                  {upload.status === 'failed' && (
                    <Badge variant="destructive">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Failed
                    </Badge>
                  )}
                  {upload.status === 'pending' && !isOnline && (
                    <Badge variant="secondary">Queued</Badge>
                  )}
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => removeUpload(upload.id)}
                data-testid={`button-remove-upload-${upload.id}`}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface DownloadManagerProps {
  className?: string;
}

export function DownloadManager({ className }: DownloadManagerProps) {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const isOnline = useOnlineStatus();
  const { toast } = useToast();

  useEffect(() => {
    loadDownloads();
  }, []);

  const loadDownloads = async () => {
    try {
      const stored = await getDownloads();
      setDownloads(stored.map(d => ({
        id: d.id,
        filename: d.filename,
        url: d.url,
        progress: d.progress,
        status: d.status,
        error: d.error
      })));
    } catch (error) {
      console.error('[DownloadManager] Failed to load downloads:', error);
    }
  };

  const startDownload = useCallback(async (url: string, filename: string) => {
    const id = await queueDownload(url, filename);
    
    const newDownload: DownloadItem = {
      id,
      filename,
      url,
      progress: 0,
      status: 'pending'
    };

    setDownloads(prev => [...prev, newDownload]);

    if (!isOnline) {
      toast({
        title: 'Download queued',
        description: `${filename} will download when you're back online`
      });
      return;
    }

    try {
      setDownloads(prev =>
        prev.map(d => d.id === id ? { ...d, status: 'downloading' as const } : d)
      );

      const response = await fetch(url);
      if (!response.ok) throw new Error('Download failed');

      const contentLength = response.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;
      
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const chunks: Uint8Array[] = [];
      let loaded = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        chunks.push(value);
        loaded += value.length;

        if (total > 0) {
          const progress = Math.round((loaded / total) * 100);
          setDownloads(prev =>
            prev.map(d => d.id === id ? { ...d, progress } : d)
          );
        }
      }

      const blob = new Blob(chunks);
      const downloadUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      setDownloads(prev =>
        prev.map(d => 
          d.id === id ? { ...d, status: 'completed' as const, progress: 100 } : d
        )
      );

      toast({
        title: 'Download complete',
        description: filename
      });
    } catch (error) {
      setDownloads(prev =>
        prev.map(d =>
          d.id === id
            ? { 
                ...d, 
                status: 'failed' as const,
                error: error instanceof Error ? error.message : 'Download failed'
              }
            : d
        )
      );

      toast({
        title: 'Download failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    }
  }, [isOnline, toast]);

  const removeDownload = useCallback((id: string) => {
    setDownloads(prev => prev.filter(d => d.id !== id));
  }, []);

  const clearCompleted = useCallback(() => {
    setDownloads(prev => prev.filter(d => d.status !== 'completed'));
  }, []);

  if (downloads.length === 0) {
    return null;
  }

  return (
    <Card className={cn("fixed bottom-4 right-4 w-80 z-50", className)}>
      <CardHeader className="py-3 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Download className="w-4 h-4" />
            Downloads
          </CardTitle>
          <Button
            size="sm"
            variant="ghost"
            onClick={clearCompleted}
            className="text-xs"
            data-testid="button-clear-downloads"
          >
            Clear completed
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="max-h-60">
          <div className="px-4 pb-4 space-y-2">
            {downloads.map((download) => (
              <div
                key={download.id}
                className="flex items-center gap-2 p-2 bg-muted/50 rounded"
                data-testid={`download-item-${download.id}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{download.filename}</p>
                  {download.status === 'downloading' && (
                    <Progress value={download.progress} className="h-1 mt-1" />
                  )}
                  {download.status === 'completed' && (
                    <span className="text-xs text-emerald-500">Complete</span>
                  )}
                  {download.status === 'failed' && (
                    <span className="text-xs text-destructive">{download.error}</span>
                  )}
                </div>
                {download.status === 'downloading' && (
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                )}
                {download.status === 'completed' && (
                  <Check className="w-4 h-4 text-emerald-500" />
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => removeDownload(download.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export function useDownload() {
  const isOnline = useOnlineStatus();
  const { toast } = useToast();

  const download = useCallback(async (url: string, filename: string) => {
    if (!isOnline) {
      await queueDownload(url, filename);
      toast({
        title: 'Download queued',
        description: `${filename} will download when you're back online`
      });
      return;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      toast({
        title: 'Download complete',
        description: filename
      });
    } catch (error) {
      toast({
        title: 'Download failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    }
  }, [isOnline, toast]);

  return { download };
}
