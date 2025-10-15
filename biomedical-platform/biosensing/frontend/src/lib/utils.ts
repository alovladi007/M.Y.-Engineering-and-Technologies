/**
 * Utility functions
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function getAlertColor(level: string): string {
  switch (level) {
    case 'critical':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'warning':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'info':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'online':
    case 'active':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'offline':
      return 'text-gray-600 bg-gray-50 border-gray-200';
    case 'connecting':
    case 'reconnecting':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'error':
      return 'text-red-600 bg-red-50 border-red-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

export function getSensorIcon(sensorType: string): string {
  switch (sensorType) {
    case 'heart_rate':
      return '❤️';
    case 'spo2':
      return '🫁';
    case 'blood_pressure_systolic':
    case 'blood_pressure_diastolic':
      return '🩺';
    case 'temperature':
      return '🌡️';
    case 'respiratory_rate':
      return '💨';
    case 'ecg':
      return '📊';
    case 'glucose':
      return '🩸';
    case 'weight':
      return '⚖️';
    case 'activity':
      return '🏃';
    case 'sleep':
      return '😴';
    default:
      return '📈';
  }
}

export function getSensorName(sensorType: string): string {
  const names: Record<string, string> = {
    heart_rate: 'Heart Rate',
    spo2: 'SpO2',
    blood_pressure_systolic: 'Blood Pressure (Systolic)',
    blood_pressure_diastolic: 'Blood Pressure (Diastolic)',
    temperature: 'Temperature',
    respiratory_rate: 'Respiratory Rate',
    ecg: 'ECG',
    glucose: 'Glucose',
    weight: 'Weight',
    activity: 'Activity',
    sleep: 'Sleep',
  };
  return names[sensorType] || sensorType;
}

export function formatValue(value: number, unit: string): string {
  return `${value.toFixed(1)} ${unit}`;
}

export function getQualityColor(score: number): string {
  if (score >= 0.8) return 'text-green-600';
  if (score >= 0.6) return 'text-yellow-600';
  return 'text-red-600';
}

export function getAnomalyBadge(isAnomaly: boolean, score: number): string {
  if (!isAnomaly) return '';
  if (score > 5) return 'SEVERE ANOMALY';
  if (score > 3) return 'ANOMALY';
  return 'MINOR ANOMALY';
}
