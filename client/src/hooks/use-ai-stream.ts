import { useState, useCallback, useRef } from 'react';

export interface StreamEvent {
  type: 'start' | 'chunk' | 'complete' | 'error' | 'progress';
  data?: string;
  progress?: number;
  message?: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

export interface UseAIStreamOptions {
  onStart?: () => void;
  onChunk?: (chunk: string, fullContent: string) => void;
  onProgress?: (progress: number, message?: string) => void;
  onComplete?: (content: string, usage?: StreamEvent['usage']) => void;
  onError?: (error: string) => void;
}

export interface StreamRequest {
  prompt: string;
  provider?: 'openai' | 'anthropic' | 'gemini' | 'grok' | 'perplexity';
  model?: string;
  maxTokens?: number;
  temperature?: number;
  context?: {
    type: 'product' | 'campaign' | 'content';
    brandVoiceId?: string;
    marketplace?: string;
    platforms?: string[];
  };
}

export function useAIStream(options: UseAIStreamOptions = {}) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [content, setContent] = useState('');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const startStream = useCallback(async (request: StreamRequest) => {
    setIsStreaming(true);
    setContent('');
    setProgress(0);
    setError(null);

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/ai/stream/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let fullContent = '';
      let buffer = '';
      let dataBuffer = '';

      const processEvent = (eventData: string) => {
        if (!eventData.trim()) return;
        
        try {
          const event: StreamEvent = JSON.parse(eventData);

          switch (event.type) {
            case 'start':
              options.onStart?.();
              break;
              
            case 'chunk':
              if (event.data) {
                fullContent += event.data;
                setContent(fullContent);
                options.onChunk?.(event.data, fullContent);
              }
              if (event.progress !== undefined) {
                setProgress(event.progress);
                options.onProgress?.(event.progress, event.message);
              }
              break;
              
            case 'progress':
              if (event.progress !== undefined) {
                setProgress(event.progress);
                options.onProgress?.(event.progress, event.message);
              }
              break;
              
            case 'complete':
              if (event.data) {
                fullContent = event.data;
                setContent(fullContent);
              }
              setProgress(100);
              options.onComplete?.(fullContent, event.usage);
              break;
              
            case 'error':
              setError(event.message || 'Stream error');
              options.onError?.(event.message || 'Stream error');
              break;
          }
        } catch (e) {
          console.warn('Failed to parse SSE event:', eventData);
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith(':')) {
            continue;
          }
          
          if (line.startsWith('data: ')) {
            dataBuffer += line.slice(6);
          } else if (line === '' && dataBuffer) {
            processEvent(dataBuffer);
            dataBuffer = '';
          }
        }
      }
      
      if (dataBuffer) {
        processEvent(dataBuffer);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError('Stream cancelled');
      } else {
        const errorMessage = err.message || 'Stream failed';
        setError(errorMessage);
        options.onError?.(errorMessage);
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, [options]);

  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    cancelStream();
    setContent('');
    setProgress(0);
    setError(null);
    setIsStreaming(false);
  }, [cancelStream]);

  return {
    isStreaming,
    content,
    progress,
    error,
    startStream,
    cancelStream,
    reset,
  };
}
