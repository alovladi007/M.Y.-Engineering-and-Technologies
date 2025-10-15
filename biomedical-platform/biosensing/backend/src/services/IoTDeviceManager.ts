/**
 * IoT Device Manager
 * Manages AWS IoT Core device connections and MQTT messaging
 */

import { device as awsIotDevice } from 'aws-iot-device-sdk';
import { Server as SocketIOServer } from 'socket.io';
import { EventEmitter } from 'events';
import logger from '../utils/logger';
import { BiosensorReading, DeviceStatus, DeviceConfig } from '../types';

export interface DeviceConnection {
  deviceId: string;
  device: awsIotDevice;
  status: DeviceStatus;
  lastSeen: Date;
  patientId?: string;
  config: DeviceConfig;
}

export class IoTDeviceManager extends EventEmitter {
  private devices: Map<string, DeviceConnection>;
  private io: SocketIOServer;
  private reconnectAttempts: Map<string, number>;
  private maxReconnectAttempts = 5;

  constructor(io: SocketIOServer) {
    super();
    this.devices = new Map();
    this.io = io;
    this.reconnectAttempts = new Map();

    logger.info('IoT Device Manager initialized');
  }

  /**
   * Connect a biosensor device to AWS IoT Core
   */
  async connectDevice(
    deviceId: string,
    patientId: string | undefined,
    config: DeviceConfig
  ): Promise<void> {
    try {
      // Check if device already connected
      if (this.devices.has(deviceId)) {
        logger.warn(`Device ${deviceId} already connected`);
        return;
      }

      // Create AWS IoT device connection
      const device = new awsIotDevice({
        keyPath: config.privateKeyPath || process.env.AWS_IOT_PRIVATE_KEY_PATH,
        certPath: config.certificatePath || process.env.AWS_IOT_CERTIFICATE_PATH,
        caPath: config.caPath || process.env.AWS_IOT_CA_PATH,
        clientId: deviceId,
        host: config.endpoint || process.env.AWS_IOT_ENDPOINT,
      });

      // Store device connection
      const connection: DeviceConnection = {
        deviceId,
        device,
        status: 'connecting',
        lastSeen: new Date(),
        patientId,
        config,
      };
      this.devices.set(deviceId, connection);

      // Setup device event handlers
      this.setupDeviceHandlers(deviceId, device);

      logger.info(`Connecting device ${deviceId}`, { patientId });
    } catch (error) {
      logger.error(`Failed to connect device ${deviceId}`, { error });
      throw error;
    }
  }

  /**
   * Setup AWS IoT device event handlers
   */
  private setupDeviceHandlers(deviceId: string, device: awsIotDevice): void {
    // Connection established
    device.on('connect', () => {
      logger.info(`Device ${deviceId} connected to AWS IoT Core`);
      this.updateDeviceStatus(deviceId, 'online');
      this.reconnectAttempts.delete(deviceId);

      // Subscribe to device topics
      const topics = [
        `biosensor/${deviceId}/data`,
        `biosensor/${deviceId}/status`,
        `biosensor/${deviceId}/alerts`,
      ];

      topics.forEach((topic) => {
        device.subscribe(topic);
        logger.info(`Device ${deviceId} subscribed to ${topic}`);
      });

      // Emit connection event
      this.emit('device:connected', { deviceId });

      // Notify WebSocket clients
      this.notifyDeviceStatus(deviceId, 'online');
    });

    // Message received
    device.on('message', (topic: string, payload: Buffer) => {
      this.handleDeviceMessage(deviceId, topic, payload);
    });

    // Connection error
    device.on('error', (error: Error) => {
      logger.error(`Device ${deviceId} error`, { error });
      this.updateDeviceStatus(deviceId, 'error');
      this.emit('device:error', { deviceId, error });

      // Attempt reconnection
      this.attemptReconnection(deviceId);
    });

    // Connection closed
    device.on('close', () => {
      logger.warn(`Device ${deviceId} connection closed`);
      this.updateDeviceStatus(deviceId, 'offline');
      this.emit('device:disconnected', { deviceId });
      this.notifyDeviceStatus(deviceId, 'offline');

      // Attempt reconnection
      this.attemptReconnection(deviceId);
    });

    // Reconnect event
    device.on('reconnect', () => {
      logger.info(`Device ${deviceId} reconnecting...`);
      this.updateDeviceStatus(deviceId, 'reconnecting');
    });

    // Offline event
    device.on('offline', () => {
      logger.warn(`Device ${deviceId} went offline`);
      this.updateDeviceStatus(deviceId, 'offline');
      this.notifyDeviceStatus(deviceId, 'offline');
    });
  }

  /**
   * Handle incoming MQTT message from device
   */
  private handleDeviceMessage(
    deviceId: string,
    topic: string,
    payload: Buffer
  ): void {
    try {
      const message = JSON.parse(payload.toString());
      const connection = this.devices.get(deviceId);

      if (!connection) {
        logger.warn(`Received message from unknown device ${deviceId}`);
        return;
      }

      // Update last seen
      connection.lastSeen = new Date();

      // Route message based on topic
      if (topic.endsWith('/data')) {
        // Biosensor data reading
        this.emit('biosensor:data', {
          deviceId,
          patientId: connection.patientId,
          data: message,
          timestamp: new Date(),
        });
      } else if (topic.endsWith('/status')) {
        // Device status update
        this.emit('device:status', {
          deviceId,
          status: message,
          timestamp: new Date(),
        });
      } else if (topic.endsWith('/alerts')) {
        // Critical alert
        this.emit('biosensor:alert', {
          deviceId,
          patientId: connection.patientId,
          alert: message,
          timestamp: new Date(),
        });

        // Notify via WebSocket immediately
        this.notifyAlert(deviceId, connection.patientId, message);
      }

      logger.debug(`Message received from device ${deviceId}`, {
        topic,
        messageSize: payload.length,
      });
    } catch (error) {
      logger.error(`Failed to handle message from device ${deviceId}`, {
        error,
        topic,
      });
    }
  }

  /**
   * Publish command to device
   */
  async publishCommand(
    deviceId: string,
    command: string,
    params: any
  ): Promise<void> {
    const connection = this.devices.get(deviceId);

    if (!connection) {
      throw new Error(`Device ${deviceId} not connected`);
    }

    if (connection.status !== 'online') {
      throw new Error(`Device ${deviceId} is not online (status: ${connection.status})`);
    }

    try {
      const topic = `biosensor/${deviceId}/commands`;
      const message = {
        command,
        params,
        timestamp: new Date().toISOString(),
      };

      connection.device.publish(topic, JSON.stringify(message));
      logger.info(`Command sent to device ${deviceId}`, { command, params });
    } catch (error) {
      logger.error(`Failed to publish command to device ${deviceId}`, {
        error,
        command,
      });
      throw error;
    }
  }

  /**
   * Update device configuration
   */
  async updateDeviceConfig(
    deviceId: string,
    config: Partial<DeviceConfig>
  ): Promise<void> {
    const connection = this.devices.get(deviceId);

    if (!connection) {
      throw new Error(`Device ${deviceId} not found`);
    }

    connection.config = { ...connection.config, ...config };

    // Send config update command to device
    await this.publishCommand(deviceId, 'updateConfig', config);

    logger.info(`Device ${deviceId} configuration updated`, { config });
  }

  /**
   * Disconnect device
   */
  async disconnectDevice(deviceId: string): Promise<void> {
    const connection = this.devices.get(deviceId);

    if (!connection) {
      logger.warn(`Device ${deviceId} not found for disconnection`);
      return;
    }

    try {
      connection.device.end(true);
      this.devices.delete(deviceId);
      this.reconnectAttempts.delete(deviceId);

      logger.info(`Device ${deviceId} disconnected`);
      this.emit('device:disconnected', { deviceId });
    } catch (error) {
      logger.error(`Failed to disconnect device ${deviceId}`, { error });
      throw error;
    }
  }

  /**
   * Disconnect all devices (graceful shutdown)
   */
  async disconnectAll(): Promise<void> {
    logger.info('Disconnecting all devices...');

    const disconnectPromises = Array.from(this.devices.keys()).map(
      (deviceId) => this.disconnectDevice(deviceId)
    );

    await Promise.all(disconnectPromises);
    logger.info('All devices disconnected');
  }

  /**
   * Get device status
   */
  getDeviceStatus(deviceId: string): DeviceStatus | null {
    const connection = this.devices.get(deviceId);
    return connection ? connection.status : null;
  }

  /**
   * Get all connected devices
   */
  getConnectedDevices(): DeviceConnection[] {
    return Array.from(this.devices.values());
  }

  /**
   * Get devices by patient ID
   */
  getDevicesByPatient(patientId: string): DeviceConnection[] {
    return Array.from(this.devices.values()).filter(
      (conn) => conn.patientId === patientId
    );
  }

  /**
   * Update device status
   */
  private updateDeviceStatus(deviceId: string, status: DeviceStatus): void {
    const connection = this.devices.get(deviceId);
    if (connection) {
      connection.status = status;
      connection.lastSeen = new Date();
    }
  }

  /**
   * Attempt device reconnection
   */
  private attemptReconnection(deviceId: string): void {
    const attempts = this.reconnectAttempts.get(deviceId) || 0;

    if (attempts >= this.maxReconnectAttempts) {
      logger.error(
        `Max reconnection attempts reached for device ${deviceId}`
      );
      this.emit('device:reconnect_failed', { deviceId });
      return;
    }

    this.reconnectAttempts.set(deviceId, attempts + 1);

    const backoffDelay = Math.min(1000 * Math.pow(2, attempts), 30000); // Exponential backoff, max 30s

    logger.info(
      `Attempting reconnection for device ${deviceId} (attempt ${attempts + 1}/${this.maxReconnectAttempts})`,
      { delay: backoffDelay }
    );

    setTimeout(() => {
      const connection = this.devices.get(deviceId);
      if (connection) {
        // Reconnection is handled automatically by AWS IoT SDK
        logger.info(`Reconnection initiated for device ${deviceId}`);
      }
    }, backoffDelay);
  }

  /**
   * Notify WebSocket clients of device status change
   */
  private notifyDeviceStatus(deviceId: string, status: DeviceStatus): void {
    const connection = this.devices.get(deviceId);
    if (!connection) return;

    // Notify device room
    this.io.to(`device:${deviceId}`).emit('device:status', {
      deviceId,
      status,
      lastSeen: connection.lastSeen,
      timestamp: new Date(),
    });

    // Notify patient room if available
    if (connection.patientId) {
      this.io.to(`patient:${connection.patientId}`).emit('device:status', {
        deviceId,
        patientId: connection.patientId,
        status,
        lastSeen: connection.lastSeen,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Notify WebSocket clients of critical alert
   */
  private notifyAlert(
    deviceId: string,
    patientId: string | undefined,
    alert: any
  ): void {
    // Notify device room
    this.io.to(`device:${deviceId}`).emit('biosensor:alert', {
      deviceId,
      patientId,
      alert,
      timestamp: new Date(),
    });

    // Notify patient room
    if (patientId) {
      this.io.to(`patient:${patientId}`).emit('biosensor:alert', {
        deviceId,
        patientId,
        alert,
        timestamp: new Date(),
      });
    }

    // Broadcast to all admins/clinicians
    this.io.emit('biosensor:critical_alert', {
      deviceId,
      patientId,
      alert,
      timestamp: new Date(),
    });

    logger.warn(`Critical alert from device ${deviceId}`, {
      patientId,
      alert,
    });
  }

  /**
   * Get device health metrics
   */
  getDeviceMetrics(deviceId: string): any {
    const connection = this.devices.get(deviceId);

    if (!connection) {
      return null;
    }

    const uptimeMs = Date.now() - connection.lastSeen.getTime();

    return {
      deviceId,
      status: connection.status,
      patientId: connection.patientId,
      lastSeen: connection.lastSeen,
      uptimeSeconds: Math.floor(uptimeMs / 1000),
      reconnectAttempts: this.reconnectAttempts.get(deviceId) || 0,
    };
  }
}
