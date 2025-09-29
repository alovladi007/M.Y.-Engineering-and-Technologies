"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HardwareController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const hardware_service_1 = require("./hardware.service");
let HardwareController = class HardwareController {
    constructor(hardwareService) {
        this.hardwareService = hardwareService;
    }
    getDevices() {
        return this.hardwareService.getDevices();
    }
    getDevice(id) {
        return this.hardwareService.getDevice(id);
    }
    connectDevice(id) {
        return this.hardwareService.connectDevice(id);
    }
    disconnectDevice(id) {
        return this.hardwareService.disconnectDevice(id);
    }
    getDeviceData(id) {
        return this.hardwareService.getDeviceData(id);
    }
    sendCommand(id, command) {
        return this.hardwareService.sendCommand(id, command);
    }
};
exports.HardwareController = HardwareController;
__decorate([
    (0, common_1.Get)('devices'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all connected devices' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HardwareController.prototype, "getDevices", null);
__decorate([
    (0, common_1.Get)('devices/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get device by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HardwareController.prototype, "getDevice", null);
__decorate([
    (0, common_1.Post)('devices/:id/connect'),
    (0, swagger_1.ApiOperation)({ summary: 'Connect to device' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HardwareController.prototype, "connectDevice", null);
__decorate([
    (0, common_1.Post)('devices/:id/disconnect'),
    (0, swagger_1.ApiOperation)({ summary: 'Disconnect from device' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HardwareController.prototype, "disconnectDevice", null);
__decorate([
    (0, common_1.Get)('devices/:id/data'),
    (0, swagger_1.ApiOperation)({ summary: 'Get real-time data from device' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HardwareController.prototype, "getDeviceData", null);
__decorate([
    (0, common_1.Post)('devices/:id/command'),
    (0, swagger_1.ApiOperation)({ summary: 'Send command to device' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], HardwareController.prototype, "sendCommand", null);
exports.HardwareController = HardwareController = __decorate([
    (0, swagger_1.ApiTags)('hardware'),
    (0, common_1.Controller)('hardware'),
    __metadata("design:paramtypes", [hardware_service_1.HardwareService])
], HardwareController);
//# sourceMappingURL=hardware.controller.js.map