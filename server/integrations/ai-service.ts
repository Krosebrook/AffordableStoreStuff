/**
 * AI Service Layer
 * Unified interface for all AI providers: OpenAI, Anthropic, Gemini, ElevenLabs, Grok, Perplexity
 * Supports both standard and streaming responses
 */

import OpenAI from 'openai';
import type { Response } from 'express';

export type AIProvider = 'openai' | 'anthropic' | 'gemini' | 'elevenlabs' | 'grok' | 'perplexity';

export interface AIGenerationRequest {
  provider: AIProvider;
  type: 'text' | 'image' | 'audio' | 'embedding';
  prompt: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  options?: Record<string, any>;
}

export interface AIGenerationResponse {
  success: boolean;
  provider: AIProvider;
  type: string;
  content?: string | string[];
  imageUrl?: string;
  audioUrl?: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  error?: string;
  metadata?: Record<string, any>;
}

export interface StreamEvent {
  type: 'start' | 'chunk' | 'complete' | 'error' | 'progress';
  data?: string;
  progress?: number;
  message?: string;
  usage?: AIGenerationResponse['usage'];
}

class AIService {
  private openai: OpenAI | null = null;

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
  }

  async generate(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    try {
      switch (request.provider) {
        case 'openai':
          return await this.generateWithOpenAI(request);
        case 'anthropic':
          return await this.generateWithAnthropic(request);
        case 'gemini':
          return await this.generateWithGemini(request);
        case 'elevenlabs':
          return await this.generateWithElevenLabs(request);
        case 'grok':
          return await this.generateWithGrok(request);
        case 'perplexity':
          return await this.generateWithPerplexity(request);
        default:
          return {
            success: false,
            provider: request.provider,
            type: request.type,
            error: `Unknown provider: ${request.provider}`,
          };
      }
    } catch (error: any) {
      return {
        success: false,
        provider: request.provider,
        type: request.type,
        error: error.message || 'Generation failed',
      };
    }
  }

  private async generateWithOpenAI(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    if (!this.openai) {
      return {
        success: false,
        provider: 'openai',
        type: request.type,
        error: 'OpenAI API key not configured',
      };
    }

    if (request.type === 'text') {
      const response = await this.openai.chat.completions.create({
        model: request.model || 'gpt-4o',
        messages: [{ role: 'user', content: request.prompt }],
        max_tokens: request.maxTokens || 2000,
        temperature: request.temperature ?? 0.7,
      });

      return {
        success: true,
        provider: 'openai',
        type: 'text',
        content: response.choices[0]?.message?.content || '',
        usage: {
          promptTokens: response.usage?.prompt_tokens,
          completionTokens: response.usage?.completion_tokens,
          totalTokens: response.usage?.total_tokens,
        },
      };
    }

    if (request.type === 'image') {
      const response = await this.openai.images.generate({
        model: request.model || 'dall-e-3',
        prompt: request.prompt,
        n: 1,
        size: request.options?.size || '1024x1024',
        quality: request.options?.quality || 'standard',
      });

      return {
        success: true,
        provider: 'openai',
        type: 'image',
        imageUrl: response.data[0]?.url,
        metadata: { revisedPrompt: response.data[0]?.revised_prompt },
      };
    }

    return {
      success: false,
      provider: 'openai',
      type: request.type,
      error: `Unsupported generation type: ${request.type}`,
    };
  }

  private async generateWithAnthropic(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return {
        success: false,
        provider: 'anthropic',
        type: request.type,
        error: 'Anthropic API key not configured',
      };
    }

    if (request.type === 'text') {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: request.model || 'claude-3-5-sonnet-20241022',
          max_tokens: request.maxTokens || 2000,
          messages: [{ role: 'user', content: request.prompt }],
        }),
      });

      const data = await response.json() as any;
      
      if (!response.ok) {
        return {
          success: false,
          provider: 'anthropic',
          type: 'text',
          error: data.error?.message || 'Anthropic API error',
        };
      }

      return {
        success: true,
        provider: 'anthropic',
        type: 'text',
        content: data.content[0]?.text || '',
        usage: {
          promptTokens: data.usage?.input_tokens,
          completionTokens: data.usage?.output_tokens,
        },
      };
    }

    return {
      success: false,
      provider: 'anthropic',
      type: request.type,
      error: `Unsupported generation type for Anthropic: ${request.type}`,
    };
  }

  private async generateWithGemini(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      return {
        success: false,
        provider: 'gemini',
        type: request.type,
        error: 'Google AI API key not configured',
      };
    }

    if (request.type === 'text') {
      const model = request.model || 'gemini-1.5-flash';
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: request.prompt }] }],
            generationConfig: {
              maxOutputTokens: request.maxTokens || 2000,
              temperature: request.temperature ?? 0.7,
            },
          }),
        }
      );

      const data = await response.json() as any;
      
      if (!response.ok) {
        return {
          success: false,
          provider: 'gemini',
          type: 'text',
          error: data.error?.message || 'Gemini API error',
        };
      }

      return {
        success: true,
        provider: 'gemini',
        type: 'text',
        content: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
        usage: {
          promptTokens: data.usageMetadata?.promptTokenCount,
          completionTokens: data.usageMetadata?.candidatesTokenCount,
        },
      };
    }

    return {
      success: false,
      provider: 'gemini',
      type: request.type,
      error: `Unsupported generation type for Gemini: ${request.type}`,
    };
  }

  private async generateWithElevenLabs(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return {
        success: false,
        provider: 'elevenlabs',
        type: request.type,
        error: 'ElevenLabs API key not configured',
      };
    }

    if (request.type === 'audio') {
      const voiceId = request.options?.voiceId || 'EXAVITQu4vr4xnSDxMaL';
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': apiKey,
          },
          body: JSON.stringify({
            text: request.prompt,
            model_id: request.model || 'eleven_multilingual_v2',
            voice_settings: {
              stability: request.options?.stability || 0.5,
              similarity_boost: request.options?.similarityBoost || 0.75,
            },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json() as any;
        return {
          success: false,
          provider: 'elevenlabs',
          type: 'audio',
          error: error.detail?.message || 'ElevenLabs API error',
        };
      }

      const audioBuffer = await response.arrayBuffer();
      const base64Audio = Buffer.from(audioBuffer).toString('base64');
      
      return {
        success: true,
        provider: 'elevenlabs',
        type: 'audio',
        audioUrl: `data:audio/mpeg;base64,${base64Audio}`,
      };
    }

    return {
      success: false,
      provider: 'elevenlabs',
      type: request.type,
      error: `ElevenLabs only supports audio generation`,
    };
  }

  private async generateWithGrok(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return {
        success: false,
        provider: 'grok',
        type: request.type,
        error: 'xAI API key not configured',
      };
    }

    if (request.type === 'text') {
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: request.model || 'grok-beta',
          messages: [{ role: 'user', content: request.prompt }],
          max_tokens: request.maxTokens || 2000,
          temperature: request.temperature ?? 0.7,
        }),
      });

      const data = await response.json() as any;
      
      if (!response.ok) {
        return {
          success: false,
          provider: 'grok',
          type: 'text',
          error: data.error?.message || 'Grok API error',
        };
      }

      return {
        success: true,
        provider: 'grok',
        type: 'text',
        content: data.choices?.[0]?.message?.content || '',
        usage: {
          promptTokens: data.usage?.prompt_tokens,
          completionTokens: data.usage?.completion_tokens,
        },
      };
    }

    return {
      success: false,
      provider: 'grok',
      type: request.type,
      error: `Unsupported generation type for Grok: ${request.type}`,
    };
  }

  private async generateWithPerplexity(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      return {
        success: false,
        provider: 'perplexity',
        type: request.type,
        error: 'Perplexity API key not configured',
      };
    }

    if (request.type === 'text') {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: request.model || 'llama-3.1-sonar-small-128k-online',
          messages: [{ role: 'user', content: request.prompt }],
          max_tokens: request.maxTokens || 2000,
          temperature: request.temperature ?? 0.7,
        }),
      });

      const data = await response.json() as any;
      
      if (!response.ok) {
        return {
          success: false,
          provider: 'perplexity',
          type: 'text',
          error: data.error?.message || 'Perplexity API error',
        };
      }

      return {
        success: true,
        provider: 'perplexity',
        type: 'text',
        content: data.choices?.[0]?.message?.content || '',
        usage: {
          promptTokens: data.usage?.prompt_tokens,
          completionTokens: data.usage?.completion_tokens,
        },
        metadata: {
          citations: data.citations,
        },
      };
    }

    return {
      success: false,
      provider: 'perplexity',
      type: request.type,
      error: `Unsupported generation type for Perplexity: ${request.type}`,
    };
  }

  getAvailableProviders(): { provider: AIProvider; available: boolean; features: string[] }[] {
    return [
      {
        provider: 'openai',
        available: !!process.env.OPENAI_API_KEY,
        features: ['text', 'image', 'audio', 'embedding'],
      },
      {
        provider: 'anthropic',
        available: !!process.env.ANTHROPIC_API_KEY,
        features: ['text'],
      },
      {
        provider: 'gemini',
        available: !!process.env.GOOGLE_AI_API_KEY,
        features: ['text', 'image-analysis'],
      },
      {
        provider: 'elevenlabs',
        available: !!process.env.ELEVENLABS_API_KEY,
        features: ['audio'],
      },
      {
        provider: 'grok',
        available: !!process.env.XAI_API_KEY,
        features: ['text'],
      },
      {
        provider: 'perplexity',
        available: !!process.env.PERPLEXITY_API_KEY,
        features: ['text', 'search'],
      },
    ];
  }

  /**
   * Stream generation with SSE support
   * Sends events directly to the response object
   * Handles client disconnection and proper cleanup
   */
  async generateStream(
    request: AIGenerationRequest, 
    res: Response,
    onEvent?: (event: StreamEvent) => void
  ): Promise<void> {
    const abortController = new AbortController();
    let isClientConnected = true;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    res.on('close', () => {
      isClientConnected = false;
      abortController.abort();
      console.log('[AI Stream] Client disconnected');
    });

    const sendEvent = (event: StreamEvent): boolean => {
      if (!isClientConnected) return false;
      try {
        res.write(`data: ${JSON.stringify(event)}\n\n`);
        onEvent?.(event);
        return true;
      } catch (e) {
        isClientConnected = false;
        return false;
      }
    };

    const sendKeepAlive = () => {
      if (isClientConnected) {
        try {
          res.write(': keepalive\n\n');
        } catch {
          isClientConnected = false;
        }
      }
    };

    const keepAliveInterval = setInterval(sendKeepAlive, 15000);

    try {
      sendEvent({ type: 'start', message: 'Starting generation...' });

      if (request.provider === 'openai' && this.openai && request.type === 'text') {
        await this.streamWithOpenAI(request, sendEvent, abortController.signal);
      } else {
        if (!isClientConnected) {
          console.log('[AI Stream] Client disconnected before generation started');
          return;
        }
        
        sendEvent({ type: 'progress', progress: 10, message: 'Preparing request...' });
        
        const generatePromise = this.generate(request);
        const abortPromise = new Promise<never>((_, reject) => {
          abortController.signal.addEventListener('abort', () => {
            reject(new Error('AbortError'));
          });
        });
        
        let result: Awaited<ReturnType<typeof this.generate>>;
        try {
          result = await Promise.race([generatePromise, abortPromise]);
        } catch (e: any) {
          if (e.message === 'AbortError' || !isClientConnected) {
            console.log('[AI Stream] Non-streaming generation aborted');
            return;
          }
          throw e;
        }
        
        if (!isClientConnected) {
          console.log('[AI Stream] Client disconnected after generation');
          return;
        }
        
        if (result.success) {
          sendEvent({ type: 'progress', progress: 90, message: 'Finalizing...' });
          
          const content = typeof result.content === 'string' 
            ? result.content 
            : result.content?.join('\n') || '';
          
          sendEvent({ 
            type: 'complete', 
            data: content,
            usage: result.usage 
          });
        } else {
          sendEvent({ type: 'error', message: result.error || 'Generation failed' });
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError' || !isClientConnected) {
        console.log('[AI Stream] Generation aborted');
      } else {
        console.error('[AI Stream Error]', error.message);
        sendEvent({ type: 'error', message: error.message || 'Stream error' });
      }
    } finally {
      clearInterval(keepAliveInterval);
      if (isClientConnected) {
        res.end();
      }
    }
  }

  private async streamWithOpenAI(
    request: AIGenerationRequest,
    sendEvent: (event: StreamEvent) => boolean,
    signal?: AbortSignal
  ): Promise<void> {
    if (!this.openai) {
      sendEvent({ type: 'error', message: 'OpenAI not configured' });
      return;
    }

    const stream = await this.openai.chat.completions.create(
      {
        model: request.model || 'gpt-4o',
        messages: [{ role: 'user', content: request.prompt }],
        max_tokens: request.maxTokens || 2000,
        temperature: request.temperature ?? 0.7,
        stream: true,
      },
      { signal }
    );

    let fullContent = '';
    let chunkCount = 0;

    try {
      for await (const chunk of stream) {
        if (signal?.aborted) {
          console.log('[AI Stream] OpenAI stream aborted by client');
          try {
            stream.controller.abort();
          } catch { }
          break;
        }
        
        const delta = chunk.choices[0]?.delta?.content || '';
        if (delta) {
          fullContent += delta;
          chunkCount++;
          
          const progress = Math.min(10 + (chunkCount * 2), 90);
          const sent = sendEvent({ type: 'chunk', data: delta, progress });
          if (!sent) {
            console.log('[AI Stream] Client disconnected during streaming');
            try {
              stream.controller.abort();
            } catch { }
            break;
          }
        }
      }

      if (!signal?.aborted) {
        sendEvent({ 
          type: 'complete', 
          data: fullContent,
          message: 'Generation complete'
        });
      }
    } catch (error: any) {
      if (signal?.aborted || error.name === 'AbortError') {
        console.log('[AI Stream] Stream cancelled');
      } else {
        throw error;
      }
    }
  }
}

export const aiService = new AIService();
