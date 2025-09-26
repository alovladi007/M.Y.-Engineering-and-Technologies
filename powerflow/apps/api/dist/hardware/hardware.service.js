"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HardwareService = void 0;
const common_1 = require("@nestjs/common");
let HardwareService = class HardwareService {
    constructor() {
        this.devices = new Map([
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
        this.deviceData = new Map();
    }
    getDevices() {
        return Array.from(this.devices.values());
    }
    getDevice(id) {
        return this.devices.get(id);
    }
    connectDevice(id) {
        const device = this.devices.get(id);
        if (device) {
            device.status = 'connected';
            device.lastSeen = new Date();
            return { message: 'Device connected', device };
        }
        return { error: 'Device not found' };
    }
    disconnectDevice(id) {
        const device = this.devices.get(id);
        if (device) {
            device.status = 'disconnected';
            return { message: 'Device disconnected', device };
        }
        return { error: 'Device not found' };
    }
    getDeviceData(id) {
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
    sendCommand(id, command) {
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
};
exports.HardwareService = HardwareService;
exports.HardwareService = HardwareService = __decorate([
    (0, common_1.Injectable)()
], HardwareService);
//# sourceMappingURL=hardware.service.js.map