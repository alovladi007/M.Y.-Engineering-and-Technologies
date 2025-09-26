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
exports.SstController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const sst_service_1 = require("./sst.service");
class CreateSstDesignDto {
}
class OptimizeSstDto {
}
let SstController = class SstController {
    constructor(sstService) {
        this.sstService = sstService;
    }
    async createDesign(createSstDesignDto) {
        try {
            return await this.sstService.createSstDesign(createSstDesignDto);
        }
        catch (error) {
            throw new common_1.HttpException('Failed to create SST design', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getDesigns() {
        return await this.sstService.getSstDesigns();
    }
    async getDesign(id) {
        const design = await this.sstService.getSstDesign(id);
        if (!design) {
            throw new common_1.HttpException('SST design not found', common_1.HttpStatus.NOT_FOUND);
        }
        return design;
    }
    async getCores() {
        return await this.sstService.getTransformerCores();
    }
    async getMaterials() {
        return await this.sstService.getMagneticMaterials();
    }
    async getDevices() {
        return await this.sstService.getDeviceCurves();
    }
    async simulate(design) {
        const fullDesign = await this.sstService.createSstDesign(design);
        return await this.sstService.simulateSst(fullDesign);
    }
    async optimize(constraints) {
        return await this.sstService.optimizeSst(constraints);
    }
};
exports.SstController = SstController;
__decorate([
    (0, common_1.Post)('designs'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new SST design' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'SST design created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateSstDesignDto]),
    __metadata("design:returntype", Promise)
], SstController.prototype, "createDesign", null);
__decorate([
    (0, common_1.Get)('designs'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all SST designs' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of SST designs' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SstController.prototype, "getDesigns", null);
__decorate([
    (0, common_1.Get)('designs/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get SST design by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'SST design details' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'SST design not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SstController.prototype, "getDesign", null);
__decorate([
    (0, common_1.Get)('cores'),
    (0, swagger_1.ApiOperation)({ summary: 'Get transformer cores' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of transformer cores' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SstController.prototype, "getCores", null);
__decorate([
    (0, common_1.Get)('materials'),
    (0, swagger_1.ApiOperation)({ summary: 'Get magnetic materials' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of magnetic materials' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SstController.prototype, "getMaterials", null);
__decorate([
    (0, common_1.Get)('devices'),
    (0, swagger_1.ApiOperation)({ summary: 'Get device curves' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of device curves' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SstController.prototype, "getDevices", null);
__decorate([
    (0, common_1.Post)('simulate'),
    (0, swagger_1.ApiOperation)({ summary: 'Simulate SST design' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Simulation results' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateSstDesignDto]),
    __metadata("design:returntype", Promise)
], SstController.prototype, "simulate", null);
__decorate([
    (0, common_1.Post)('optimize'),
    (0, swagger_1.ApiOperation)({ summary: 'Optimize SST design' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Optimization results' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [OptimizeSstDto]),
    __metadata("design:returntype", Promise)
], SstController.prototype, "optimize", null);
exports.SstController = SstController = __decorate([
    (0, swagger_1.ApiTags)('SST'),
    (0, common_1.Controller)('sst'),
    __metadata("design:paramtypes", [sst_service_1.SstService])
], SstController);
//# sourceMappingURL=sst.controller.js.map