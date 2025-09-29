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
exports.SimulationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const simulation_service_1 = require("./simulation.service");
const create_simulation_dto_1 = require("./dto/create-simulation.dto");
const update_simulation_dto_1 = require("./dto/update-simulation.dto");
let SimulationController = class SimulationController {
    constructor(simulationService) {
        this.simulationService = simulationService;
    }
    create(createSimulationDto) {
        return this.simulationService.create(createSimulationDto);
    }
    findAll() {
        return this.simulationService.findAll();
    }
    findOne(id) {
        return this.simulationService.findOne(id);
    }
    update(id, updateSimulationDto) {
        return this.simulationService.update(id, updateSimulationDto);
    }
    remove(id) {
        return this.simulationService.remove(id);
    }
    start(id) {
        return this.simulationService.start(id);
    }
    stop(id) {
        return this.simulationService.stop(id);
    }
    getResults(id) {
        return this.simulationService.getResults(id);
    }
};
exports.SimulationController = SimulationController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new simulation' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_simulation_dto_1.CreateSimulationDto]),
    __metadata("design:returntype", void 0)
], SimulationController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all simulations' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SimulationController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get simulation by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SimulationController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update simulation' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_simulation_dto_1.UpdateSimulationDto]),
    __metadata("design:returntype", void 0)
], SimulationController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete simulation' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SimulationController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/start'),
    (0, swagger_1.ApiOperation)({ summary: 'Start simulation' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SimulationController.prototype, "start", null);
__decorate([
    (0, common_1.Post)(':id/stop'),
    (0, swagger_1.ApiOperation)({ summary: 'Stop simulation' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SimulationController.prototype, "stop", null);
__decorate([
    (0, common_1.Get)(':id/results'),
    (0, swagger_1.ApiOperation)({ summary: 'Get simulation results' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SimulationController.prototype, "getResults", null);
exports.SimulationController = SimulationController = __decorate([
    (0, swagger_1.ApiTags)('simulations'),
    (0, common_1.Controller)('simulations'),
    __metadata("design:paramtypes", [simulation_service_1.SimulationService])
], SimulationController);
//# sourceMappingURL=simulation.controller.js.map