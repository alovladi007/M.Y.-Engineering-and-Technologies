/**
 * WebSocket Hook for Real-time Updates
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5003';

export interface BiosensorReading {
  deviceId: string;
  patientId?: string;
  sensor_type: string;
  value: number;
  unit: string;
  timestamp: string;
  quality_score: number;
  is_anomaly: boolean;
  anomaly_score: number;
  alerts: Array<{
    level: string;
    message: string;
    threshold_type: string;
  }>;
  metadata?: any;
}

export interface DeviceStatus {
  deviceId: string;
  patientId?: string;
  status: string;
  lastSeen: string;
  timestamp: string;
}

export interface BiosensorAlert {
  deviceId: string;
  patientId?: string;
  alert: any;
  timestamp: string;
}

export function useWebSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [readings, setReadings] = useState<BiosensorReading[]>([]);
  const [alerts, setAlerts] = useState<BiosensorAlert[]>([]);
  const [deviceStatuses, setDeviceStatuses] = useState<Map<string, DeviceStatus>>(new Map());

  const socketRef = useRef<Socket | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    const newSocket = io(WS_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Connection events
    newSocket.on('connect', () => {
      console.log('WebSocket connected');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    // Biosensor data events
    newSocket.on('biosensor:reading', (reading: BiosensorReading) => {
      setReadings((prev) => [reading, ...prev].slice(0, 100)); // Keep last 100
    });

    newSocket.on('biosensor:alert', (alert: BiosensorAlert) => {
      setAlerts((prev) => [alert, ...prev].slice(0, 50)); // Keep last 50
    });

    newSocket.on('biosensor:critical_alert', (alert: BiosensorAlert) => {
      // Critical alerts go to the top
      setAlerts((prev) => [alert, ...prev].slice(0, 50));

      // You could also show a browser notification here
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Critical Alert', {
          body: `Device ${alert.deviceId}: ${alert.alert?.message || 'Critical condition detected'}`,
          icon: '/alert-icon.png',
        });
      }
    });

    newSocket.on('biosensor:critical_reading', (data: any) => {
      const reading = data.reading as BiosensorReading;
      setReadings((prev) => [reading, ...prev].slice(0, 100));
    });

    // Device status events
    newSocket.on('device:status', (status: DeviceStatus) => {
      setDeviceStatuses((prev) => {
        const updated = new Map(prev);
        updated.set(status.deviceId, status);
        return updated;
      });
    });

    // Cleanup on unmount
    return () => {
      newSocket.close();
    };
  }, []);

  // Subscribe to device updates
  const subscribeToDevice = useCallback((deviceId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('subscribe:device', deviceId);
      console.log(`Subscribed to device: ${deviceId}`);
    }
  }, []);

  // Subscribe to patient updates
  const subscribeToPatient = useCallback((patientId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('subscribe:patient', patientId);
      console.log(`Subscribed to patient: ${patientId}`);
    }
  }, []);

  // Unsubscribe from room
  const unsubscribe = useCallback((room: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('unsubscribe', room);
      console.log(`Unsubscribed from: ${room}`);
    }
  }, []);

  // Clear readings
  const clearReadings = useCallback(() => {
    setReadings([]);
  }, []);

  // Clear alerts
  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Get device status
  const getDeviceStatus = useCallback((deviceId: string): DeviceStatus | undefined => {
    return deviceStatuses.get(deviceId);
  }, [deviceStatuses]);

  return {
    socket,
    connected,
    readings,
    alerts,
    deviceStatuses,
    subscribeToDevice,
    subscribeToPatient,
    unsubscribe,
    clearReadings,
    clearAlerts,
    getDeviceStatus,
  };
}
