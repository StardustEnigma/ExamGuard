import type { TelemetryEvent } from '../types';

type EventCallback = (event: TelemetryEvent) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private callbacks: EventCallback[] = [];
  private reconnectTimeout: number | null = null;

  constructor(url: string) {
    this.url = url;
  }

  connect() {
    // Agar already connected hai toh wapas connect mat karo
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log('🟢 [ExamGuard] Connected to Go Edge-Server');
      if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    };

    this.ws.onmessage = (event) => {
      try {
        const data: TelemetryEvent = JSON.parse(event.data);
        this.callbacks.forEach(cb => cb(data));
      } catch (error) {
        console.error('🔴 [ExamGuard] Malformed telemetry packet:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('🟡 [ExamGuard] Connection lost. Attempting reconnect in 3s...');
      this.reconnectTimeout = window.setTimeout(() => this.connect(), 3000);
    };

    this.ws.onerror = (error) => {
      console.error('🔴 [ExamGuard] WebSocket Error:', error);
      this.ws?.close();
    };
  }

  subscribe(callback: EventCallback) {
    this.callbacks.push(callback);
    // Return unsubscribe function
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    };
  }

  disconnect() {
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    this.ws?.close();
  }
}

// Default Go backend URL (Atharva ko yahi port use karne bolna)
export const telemetrySocket = new WebSocketService('ws://localhost:8080/ws');