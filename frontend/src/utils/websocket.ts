// src/utils/websocket.ts
// WebSocket client for DeepFilterNet Python server

import type { DeepFilterRole } from '../types/audio';

export type WebSocketConfig = {
  url: string;
  role: DeepFilterRole;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  onAudioData?: (data: ArrayBuffer) => void;
  onMessage?: (data: any) => void;
};

export class DeepFilterWebSocket {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: number | null = null;
  private isManualClose = false;

  constructor(config: WebSocketConfig) {
    this.config = config;
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('[WebSocket] Already connected');
      return;
    }

    this.isManualClose = false;
    console.log(`[WebSocket] Connecting to ${this.config.url}...`);

    try {
      this.ws = new WebSocket(this.config.url);
      this.ws.binaryType = 'arraybuffer';

      this.ws.onopen = () => {
        console.log('[WebSocket] Connected!');
        this.reconnectAttempts = 0;
        
        // Register role with server
        this.send({
          type: 'register',
          role: this.config.role
        });

        this.config.onOpen?.();
      };

      this.ws.onclose = (event) => {
        console.log(`[WebSocket] Disconnected: ${event.code} ${event.reason}`);
        this.config.onClose?.();

        // Auto-reconnect if not manually closed
        if (!this.isManualClose && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
          console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
          
          this.reconnectTimeout = window.setTimeout(() => {
            this.connect();
          }, delay);
        }
      };

      this.ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
        this.config.onError?.(error);
      };

      this.ws.onmessage = (event) => {
        if (event.data instanceof ArrayBuffer) {
          // Binary audio data (for receivers)
          this.config.onAudioData?.(event.data);
        } else if (typeof event.data === 'string') {
          // JSON message
          try {
            const data = JSON.parse(event.data);
            console.log('[WebSocket] Message:', data);
            this.config.onMessage?.(data);
          } catch (e) {
            console.error('[WebSocket] Failed to parse message:', e);
          }
        }
      };

    } catch (error) {
      console.error('[WebSocket] Connection failed:', error);
      this.config.onError?.(error as Event);
    }
  }

  disconnect(): void {
    this.isManualClose = true;
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      console.log('[WebSocket] Disconnecting...');
      this.ws.close();
      this.ws = null;
    }
  }

  send(data: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      if (data instanceof ArrayBuffer) {
        this.ws.send(data);
      } else {
        this.ws.send(JSON.stringify(data));
      }
    } else {
      console.warn('[WebSocket] Cannot send - not connected');
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  getReadyState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED;
  }
}

// Helper: Convert Float32Array to Int16 (for sending to Python server)
export function float32ToInt16(float32: Float32Array): ArrayBuffer {
  const int16 = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]));
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return int16.buffer;
}

// Helper: Convert Int16 to Float32 (for receiving from Python server)
export function int16ToFloat32(arrayBuffer: ArrayBuffer): Float32Array {
  const int16 = new Int16Array(arrayBuffer);
  const float32 = new Float32Array(int16.length);
  for (let i = 0; i < int16.length; i++) {
    float32[i] = int16[i] / 32768;
  }
  return float32;
}