import { HardwareService } from './hardware.service';
export declare class HardwareController {
    private readonly hardwareService;
    constructor(hardwareService: HardwareService);
    getDevices(): {
        id: string;
        name: string;
        type: string;
        status: string;
        firmware: string;
        lastSeen: Date;
    }[];
    getDevice(id: string): {
        id: string;
        name: string;
        type: string;
        status: string;
        firmware: string;
        lastSeen: Date;
    };
    connectDevice(id: string): {
        message: string;
        device: {
            id: string;
            name: string;
            type: string;
            status: string;
            firmware: string;
            lastSeen: Date;
        };
        error?: undefined;
    } | {
        error: string;
        message?: undefined;
        device?: undefined;
    };
    disconnectDevice(id: string): {
        message: string;
        device: {
            id: string;
            name: string;
            type: string;
            status: string;
            firmware: string;
            lastSeen: Date;
        };
        error?: undefined;
    } | {
        error: string;
        message?: undefined;
        device?: undefined;
    };
    getDeviceData(id: string): {
        deviceId: string;
        timestamp: Date;
        data: {
            voltage: number;
            current: number;
            temperature: number;
            pwmDutyCycle: number;
            frequency: number;
        };
    };
    sendCommand(id: string, command: any): {
        message: string;
        deviceId: string;
        command: any;
        timestamp: Date;
        error?: undefined;
    } | {
        error: string;
        message?: undefined;
        deviceId?: undefined;
        command?: undefined;
        timestamp?: undefined;
    };
}
