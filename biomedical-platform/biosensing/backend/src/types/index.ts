/**
 * TypeScript type definitions for Biosensing Backend
 */

export type DeviceStatus =
  | 'connecting'
  | 'online'
  | 'offline'
  | 'error'
  | 'reconnecting';

export type BiosensorType =
  | 'heart_rate'
  | 'spo2'
  | 'blood_pressure_systolic'
  | 'blood_pressure_diastolic'
  | 'temperature'
  | 'respiratory_rate'
  | 'ecg'
  | 'glucose'
  | 'weight'
  | 'activity'
  | 'sleep';

export type AlertLevel = 'info' | 'warning' | 'critical';

export interface DeviceConfig {
  privateKeyPath?: string;
  certificatePath?: string;
  caPath?: string;
  endpoint?: string;
  samplingRate?: number; // Hz
  transmissionInterval?: number; // seconds
  enableCompression?: boolean;
  enableEncryption?: boolean;
}

export interface BiosensorReading {
  sensor_type: BiosensorType;
  value: number;
  unit: string;
  timestamp: string;
  metadata?: {
    signal_strength?: number; // 0-100
    battery_level?: number; // 0-100
    noise_level?: number; // 0-1
    calibration_date?: string;
    firmware_version?: string;
    [key: string]: any;
  };
}

export interface ProcessedReading extends BiosensorReading {
  deviceId: string;
  patientId?: string;
  processed_at: Date;
  quality_score: number; // 0-1
  is_anomaly: boolean;
  anomaly_score: number;
  alerts: Array<{
    level: AlertLevel;
    message: string;
    threshold_type: string;
  }>;
}

export interface AlertThreshold {
  critical_low: number;
  warning_low: number;
  warning_high: number;
  critical_high: number;
}

export interface Patient {
  id: string;
  mrn: string; // Medical Record Number
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender?: string;
  contact_email?: string;
  contact_phone?: string;
  emergency_contact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  medical_history?: string[];
  allergies?: string[];
  medications?: string[];
  created_at: Date;
  updated_at: Date;
}

export interface Device {
  id: string;
  device_type: string;
  manufacturer: string;
  model: string;
  serial_number: string;
  firmware_version?: string;
  assigned_patient_id?: string;
  status: DeviceStatus;
  last_seen?: Date;
  registered_at: Date;
  config: DeviceConfig;
}

export interface Alert {
  id: string;
  device_id: string;
  patient_id?: string;
  reading_id?: string;
  level: AlertLevel;
  message: string;
  threshold_type?: string;
  acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: Date;
  created_at: Date;
}

export interface MonitoringSession {
  id: string;
  patient_id: string;
  device_id: string;
  started_at: Date;
  ended_at?: Date;
  status: 'active' | 'completed' | 'aborted';
  total_readings?: number;
  alerts_generated?: number;
  notes?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  };
  timestamp: string;
}

export interface QueryParams {
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  search?: string;
}

export interface DeviceQueryParams extends QueryParams {
  status?: DeviceStatus;
  patient_id?: string;
  device_type?: string;
}

export interface ReadingQueryParams extends QueryParams {
  device_id?: string;
  patient_id?: string;
  sensor_type?: BiosensorType;
  start_date?: string;
  end_date?: string;
}

export interface AlertQueryParams extends QueryParams {
  device_id?: string;
  patient_id?: string;
  level?: AlertLevel;
  acknowledged?: boolean;
  start_date?: string;
  end_date?: string;
}
