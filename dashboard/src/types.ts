export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface TelemetryEvent {
  event_id: string;
  student_id: string;
  timestamp: string;
  subtype: string;
  severity: SeverityLevel;
  confidence: number;
  message: string;
}

export interface Candidate {
  student_id: string;
  name: string;
  trust_score: number;
  status: 'ACTIVE' | 'FLAGGED' | 'DISCONNECTED';
  last_violation?: string;
}