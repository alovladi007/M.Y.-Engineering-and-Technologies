import { Injectable } from '@nestjs/common';

@Injectable()
export class HardwareService {
  private devices = new Map([
    ['stm32-1', {
      id: 'stm32-1',
      name: 'STM32F4 Discovery',
      type: 'STM32',
      status: 'connected',
      firmware: 'v1.2.0',
      lastSeen: new Date(),
    }],
    ['stm32-2', {
      id: 'stm32-2',
      name: 'STM32H7 Nucleo',
      type: 'STM32',
      status: 'connected',
      firmware: 'v1.2.0',
      lastSeen: new Date(),
    }],
    ['rpi-1', {
      id: 'rpi-1',
      name: 'Raspberry Pi 4',
      type: 'RaspberryPi',
      status: 'connected',
      firmware: 'v2.0.0',
      lastSeen: new Date(),
    }],
  ]);

  private deviceData = new Map();

  getDevices() {
    return Array.from(this.devices.values());
  }

  getDevice(id: string) {
    return this.devices.get(id);
  }

  connectDevice(id: string) {
    const device = this.devices.get(id);
    if (device) {
      device.status = 'connected';
      device.lastSeen = new Date();
      return { message: 'Device connected', device };
    }
    return { error: 'Device not found' };
  }

  disconnectDevice(id: string) {
    const device = this.devices.get(id);
    if (device) {
      device.status = 'disconnected';
      return { message: 'Device disconnected', device };
    }
    return { error: 'Device not found' };
  }

  getDeviceData(id: string) {
    // Simulate real-time data
    return {
      deviceId: id,
      timestamp: new Date(),
      data: {
        voltage: 12 + Math.random() * 0.5,
        current: 2 + Math.random() * 0.2,
        temperature: 45 + Math.random() * 5,
        pwmDutyCycle: 0.75 + Math.random() * 0.1,
        frequency: 100000,
      },
    };
  }

  sendCommand(id: string, command: any) {
    const device = this.devices.get(id);
    if (device) {
      return {
        message: 'Command sent successfully',
        deviceId: id,
        command,
        timestamp: new Date(),
      };
    }
    return { error: 'Device not found' };
  }
}