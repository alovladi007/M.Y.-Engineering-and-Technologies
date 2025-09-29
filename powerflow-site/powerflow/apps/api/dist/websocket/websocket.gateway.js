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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
let WebSocketGateway = class WebSocketGateway {
    constructor() {
        this.logger = new common_1.Logger('WebSocketGateway');
    }
    afterInit(server) {
        this.logger.log('WebSocket Gateway initialized');
    }
    handleConnection(client) {
        this.logger.log(`Client connected: ${client.id}`);
        const interval = setInterval(() => {
            client.emit('realtime-data', {
                timestamp: new Date(),
                voltage: 12 + Math.sin(Date.now() / 1000) * 2,
                current: 10 + Math.random() * 2,
                power: 120 + Math.random() * 20,
                efficiency: 0.94 + Math.random() * 0.02,
                temperature: 45 + Math.random() * 5,
            });
        }, 1000);
        client.on('disconnect', () => {
            clearInterval(interval);
        });
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }
    handleSimulationControl(client, payload) {
        this.logger.log(`Simulation control: ${JSON.stringify(payload)}`);
        return { event: 'simulation-status', data: payload };
    }
    handleHardwareControl(client, payload) {
        this.logger.log(`Hardware control: ${JSON.stringify(payload)}`);
        return { event: 'hardware-status', data: payload };
    }
};
exports.WebSocketGateway = WebSocketGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], WebSocketGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('simulation-control'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], WebSocketGateway.prototype, "handleSimulationControl", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('hardware-control'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], WebSocketGateway.prototype, "handleHardwareControl", null);
exports.WebSocketGateway = WebSocketGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: 'http://localhost:3000',
            credentials: true,
        },
    })
], WebSocketGateway);
//# sourceMappingURL=websocket.gateway.js.map