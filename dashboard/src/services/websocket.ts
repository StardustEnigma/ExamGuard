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
        const raw = JSON.parse(event.data);
        // Handle both wrapped INCIDENT_ALERT / payload packets and raw TelemetryEvent packets
        let data: TelemetryEvent | null = null;
        if (raw?.type === 'INCIDENT_ALERT' && raw?.payload) {
          data = raw.payload as TelemetryEvent;
        } else if (raw?.payload && (raw.payload.event_id || raw.payload.student_id)) {
          data = raw.payload as TelemetryEvent;
        } else if (raw?.event_id || raw?.student_id) {
          data = raw as TelemetryEvent;
        }

        if (data) {
          this.callbacks.forEach(cb => cb(data));
        }
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

// Go backend WebSocket endpoint
const defaultWsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.hostname || 'localhost'}:8080/ws/invigilator?token=inv_token&exam_id=exam_2026_cs501`;
export const telemetrySocket = new WebSocketService((import.meta as any).env?.VITE_WS_URL || defaultWsUrl);