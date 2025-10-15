/**
 * Biosensor Data Processor
 * Processes, validates, and streams real-time biosensor data
 */

import { Server as SocketIOServer } from 'socket.io';
import { EventEmitter } from 'events';
import logger from '../utils/logger';
import {
  BiosensorReading,
  ProcessedReading,
  BiosensorType,
  AlertThreshold,
  AlertLevel,
} from '../types';

export interface ProcessingConfig {
  enableValidation: boolean;
  enableAnomalyDetection: boolean;
  enableAlertGeneration: boolean;
  samplingRate: number; // Hz
  windowSize: number; // seconds
  alertThresholds: Map<BiosensorType, AlertThreshold>;
}

export class BiosensorDataProcessor extends EventEmitter {
  private io: SocketIOServer;
  private config: ProcessingConfig;
  private dataBuffers: Map<string, BiosensorReading[]>; // deviceId -> readings
  private lastProcessedTime: Map<string, number>; // deviceId -> timestamp
  private anomalyScores: Map<string, number[]>; // deviceId -> scores

  constructor(io: SocketIOServer, config?: Partial<ProcessingConfig>) {
    super();
    this.io = io;
    this.dataBuffers = new Map();
    this.lastProcessedTime = new Map();
    this.anomalyScores = new Map();

    // Default configuration
    this.config = {
      enableValidation: true,
      enableAnomalyDetection: true,
      enableAlertGeneration: true,
      samplingRate: 100, // 100 Hz
      windowSize: 10, // 10 seconds
      alertThresholds: this.getDefaultAlertThresholds(),
      ...config,
    };

    logger.info('Biosensor Data Processor initialized', { config: this.config });
  }

  /**
   * Process incoming biosensor reading
   */
  async processReading(
    deviceId: string,
    patientId: string | undefined,
    reading: BiosensorReading
  ): Promise<ProcessedReading | null> {
    try {
      // Step 1: Validate reading
      if (this.config.enableValidation) {
        const validationResult = this.validateReading(reading);
        if (!validationResult.valid) {
          logger.warn(`Invalid biosensor reading from device ${deviceId}`, {
            errors: validationResult.errors,
          });
          return null;
        }
      }

      // Step 2: Add to buffer
      this.addToBuffer(deviceId, reading);

      // Step 3: Process reading
      const processedReading: ProcessedReading = {
        ...reading,
        deviceId,
        patientId,
        processed_at: new Date(),
        quality_score: this.calculateQualityScore(reading),
        is_anomaly: false,
        anomaly_score: 0,
        alerts: [],
      };

      // Step 4: Detect anomalies
      if (this.config.enableAnomalyDetection) {
        const anomalyResult = this.detectAnomaly(deviceId, reading);
        processedReading.is_anomaly = anomalyResult.isAnomaly;
        processedReading.anomaly_score = anomalyResult.score;

        if (anomalyResult.isAnomaly) {
          logger.warn(`Anomaly detected in device ${deviceId}`, {
            sensorType: reading.sensor_type,
            score: anomalyResult.score,
          });
        }
      }

      // Step 5: Generate alerts
      if (this.config.enableAlertGeneration) {
        const alerts = this.generateAlerts(reading);
        processedReading.alerts = alerts;

        if (alerts.length > 0) {
          this.emit('biosensor:alerts', {
            deviceId,
            patientId,
            reading: processedReading,
            alerts,
          });
        }
      }

      // Step 6: Stream to WebSocket clients
      this.streamReading(deviceId, patientId, processedReading);

      // Step 7: Store processing timestamp
      this.lastProcessedTime.set(deviceId, Date.now());

      // Emit event for persistence
      this.emit('biosensor:processed', {
        deviceId,
        patientId,
        reading: processedReading,
      });

      return processedReading;
    } catch (error) {
      logger.error(`Failed to process reading from device ${deviceId}`, {
        error,
      });
      return null;
    }
  }

  /**
   * Validate biosensor reading
   */
  private validateReading(reading: BiosensorReading): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Required fields
    if (!reading.sensor_type) {
      errors.push('Missing sensor_type');
    }
    if (reading.value === undefined || reading.value === null) {
      errors.push('Missing value');
    }
    if (!reading.unit) {
      errors.push('Missing unit');
    }
    if (!reading.timestamp) {
      errors.push('Missing timestamp');
    }

    // Value range validation
    const threshold = this.config.alertThresholds.get(reading.sensor_type);
    if (threshold) {
      // Check if value is within physically possible range
      const { critical_low, critical_high } = threshold;
      const physicalLow = critical_low * 0.5; // 50% below critical
      const physicalHigh = critical_high * 2.0; // 200% above critical

      if (reading.value < physicalLow || reading.value > physicalHigh) {
        errors.push(
          `Value ${reading.value} outside physically possible range [${physicalLow}, ${physicalHigh}]`
        );
      }
    }

    // Timestamp validation (not too old, not in future)
    const now = Date.now();
    const readingTime = new Date(reading.timestamp).getTime();
    const timeDiff = Math.abs(now - readingTime);

    if (timeDiff > 60000) {
      // More than 1 minute difference
      errors.push(`Timestamp too old or in future (diff: ${timeDiff}ms)`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Calculate quality score for reading (0-1)
   */
  private calculateQualityScore(reading: BiosensorReading): number {
    let score = 1.0;

    // Reduce score for missing optional fields
    if (!reading.metadata?.signal_strength) {
      score -= 0.1;
    } else if (reading.metadata.signal_strength < 50) {
      score -= 0.2; // Poor signal strength
    }

    if (!reading.metadata?.battery_level) {
      score -= 0.05;
    } else if (reading.metadata.battery_level < 20) {
      score -= 0.15; // Low battery
    }

    // Check for measurement noise
    if (reading.metadata?.noise_level && reading.metadata.noise_level > 0.3) {
      score -= 0.2;
    }

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Add reading to buffer for windowed processing
   */
  private addToBuffer(deviceId: string, reading: BiosensorReading): void {
    if (!this.dataBuffers.has(deviceId)) {
      this.dataBuffers.set(deviceId, []);
    }

    const buffer = this.dataBuffers.get(deviceId)!;
    buffer.push(reading);

    // Keep only readings within window
    const windowMs = this.config.windowSize * 1000;
    const cutoffTime = Date.now() - windowMs;

    const filteredBuffer = buffer.filter((r) => {
      const readingTime = new Date(r.timestamp).getTime();
      return readingTime > cutoffTime;
    });

    this.dataBuffers.set(deviceId, filteredBuffer);
  }

  /**
   * Detect anomalies using statistical methods
   */
  private detectAnomaly(
    deviceId: string,
    reading: BiosensorReading
  ): { isAnomaly: boolean; score: number } {
    const buffer = this.dataBuffers.get(deviceId);

    if (!buffer || buffer.length < 10) {
      // Not enough data for anomaly detection
      return { isAnomaly: false, score: 0 };
    }

    // Get readings of same sensor type
    const sameTypeReadings = buffer.filter(
      (r) => r.sensor_type === reading.sensor_type
    );

    if (sameTypeReadings.length < 10) {
      return { isAnomaly: false, score: 0 };
    }

    // Calculate mean and standard deviation
    const values = sameTypeReadings.map((r) => r.value);
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance =
      values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) /
      values.length;
    const stdDev = Math.sqrt(variance);

    // Z-score anomaly detection
    const zScore = Math.abs((reading.value - mean) / stdDev);
    const isAnomaly = zScore > 3; // 3 standard deviations

    // Store anomaly score
    if (!this.anomalyScores.has(deviceId)) {
      this.anomalyScores.set(deviceId, []);
    }
    const scores = this.anomalyScores.get(deviceId)!;
    scores.push(zScore);
    if (scores.length > 100) {
      scores.shift(); // Keep last 100 scores
    }

    return {
      isAnomaly,
      score: zScore,
    };
  }

  /**
   * Generate alerts based on thresholds
   */
  private generateAlerts(reading: BiosensorReading): Array<{
    level: AlertLevel;
    message: string;
    threshold_type: string;
  }> {
    const alerts: Array<{
      level: AlertLevel;
      message: string;
      threshold_type: string;
    }> = [];

    const threshold = this.config.alertThresholds.get(reading.sensor_type);

    if (!threshold) {
      return alerts;
    }

    const { critical_low, critical_high, warning_low, warning_high } =
      threshold;

    // Critical alerts
    if (reading.value <= critical_low) {
      alerts.push({
        level: 'critical',
        message: `${reading.sensor_type} critically low: ${reading.value} ${reading.unit} (threshold: ${critical_low})`,
        threshold_type: 'critical_low',
      });
    } else if (reading.value >= critical_high) {
      alerts.push({
        level: 'critical',
        message: `${reading.sensor_type} critically high: ${reading.value} ${reading.unit} (threshold: ${critical_high})`,
        threshold_type: 'critical_high',
      });
    }
    // Warning alerts
    else if (reading.value <= warning_low) {
      alerts.push({
        level: 'warning',
        message: `${reading.sensor_type} low: ${reading.value} ${reading.unit} (threshold: ${warning_low})`,
        threshold_type: 'warning_low',
      });
    } else if (reading.value >= warning_high) {
      alerts.push({
        level: 'warning',
        message: `${reading.sensor_type} high: ${reading.value} ${reading.unit} (threshold: ${warning_high})`,
        threshold_type: 'warning_high',
      });
    }

    return alerts;
  }

  /**
   * Stream processed reading to WebSocket clients
   */
  private streamReading(
    deviceId: string,
    patientId: string | undefined,
    reading: ProcessedReading
  ): void {
    // Emit to device room
    this.io.to(`device:${deviceId}`).emit('biosensor:reading', reading);

    // Emit to patient room
    if (patientId) {
      this.io.to(`patient:${patientId}`).emit('biosensor:reading', reading);
    }

    // Emit critical alerts to all listeners
    if (reading.alerts.some((a) => a.level === 'critical')) {
      this.io.emit('biosensor:critical_reading', {
        deviceId,
        patientId,
        reading,
      });
    }
  }

  /**
   * Get default alert thresholds for different biosensor types
   */
  private getDefaultAlertThresholds(): Map<BiosensorType, AlertThreshold> {
    const thresholds = new Map<BiosensorType, AlertThreshold>();

    // Heart rate (BPM)
    thresholds.set('heart_rate', {
      critical_low: 40,
      warning_low: 50,
      warning_high: 120,
      critical_high: 150,
    });

    // SpO2 (%)
    thresholds.set('spo2', {
      critical_low: 85,
      warning_low: 90,
      warning_high: 100,
      critical_high: 100,
    });

    // Blood pressure systolic (mmHg)
    thresholds.set('blood_pressure_systolic', {
      critical_low: 80,
      warning_low: 90,
      warning_high: 140,
      critical_high: 180,
    });

    // Blood pressure diastolic (mmHg)
    thresholds.set('blood_pressure_diastolic', {
      critical_low: 50,
      warning_low: 60,
      warning_high: 90,
      critical_high: 110,
    });

    // Body temperature (°C)
    thresholds.set('temperature', {
      critical_low: 35.0,
      warning_low: 36.0,
      warning_high: 38.0,
      critical_high: 39.5,
    });

    // Respiratory rate (breaths/min)
    thresholds.set('respiratory_rate', {
      critical_low: 8,
      warning_low: 12,
      warning_high: 20,
      critical_high: 30,
    });

    // ECG heart rate (BPM)
    thresholds.set('ecg', {
      critical_low: 40,
      warning_low: 50,
      warning_high: 120,
      critical_high: 150,
    });

    // Glucose (mg/dL)
    thresholds.set('glucose', {
      critical_low: 50,
      warning_low: 70,
      warning_high: 180,
      critical_high: 250,
    });

    return thresholds;
  }

  /**
   * Update alert thresholds for a sensor type
   */
  updateAlertThresholds(
    sensorType: BiosensorType,
    threshold: AlertThreshold
  ): void {
    this.config.alertThresholds.set(sensorType, threshold);
    logger.info(`Alert thresholds updated for ${sensorType}`, { threshold });
  }

  /**
   * Get processing statistics for a device
   */
  getDeviceStatistics(deviceId: string): any {
    const buffer = this.dataBuffers.get(deviceId);
    const anomalyScores = this.anomalyScores.get(deviceId);
    const lastProcessed = this.lastProcessedTime.get(deviceId);

    if (!buffer) {
      return null;
    }

    // Calculate stats per sensor type
    const sensorTypes = [...new Set(buffer.map((r) => r.sensor_type))];
    const sensorStats = sensorTypes.map((sensorType) => {
      const readings = buffer.filter((r) => r.sensor_type === sensorType);
      const values = readings.map((r) => r.value);

      return {
        sensor_type: sensorType,
        count: readings.length,
        latest: readings[readings.length - 1],
        mean:
          values.reduce((sum, v) => sum + v, 0) / values.length || 0,
        min: Math.min(...values),
        max: Math.max(...values),
      };
    });

    return {
      deviceId,
      buffer_size: buffer.length,
      sensor_types: sensorTypes,
      sensor_statistics: sensorStats,
      anomaly_scores: anomalyScores || [],
      last_processed: lastProcessed ? new Date(lastProcessed) : null,
    };
  }

  /**
   * Clear device data buffer
   */
  clearDeviceBuffer(deviceId: string): void {
    this.dataBuffers.delete(deviceId);
    this.anomalyScores.delete(deviceId);
    this.lastProcessedTime.delete(deviceId);
    logger.info(`Cleared data buffer for device ${deviceId}`);
  }

  /**
   * Get configuration
   */
  getConfig(): ProcessingConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ProcessingConfig>): void {
    this.config = { ...this.config, ...config };
    logger.info('Biosensor Data Processor configuration updated', {
      config: this.config,
    });
  }
}
