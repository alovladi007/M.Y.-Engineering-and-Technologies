"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SstService = void 0;
const common_1 = require("@nestjs/common");
let SstService = class SstService {
    constructor() {
        this.sstDesigns = new Map();
        this.transformerCores = [
            {
                id: 'core-1',
                vendor: 'Ferroxcube',
                coreType: 'ETD49',
                Ae: 2.11,
                Ve: 12.7,
                le: 11.6,
                window: 2.32,
                materialId: 'n87'
            },
            {
                id: 'core-2',
                vendor: 'TDK',
                coreType: 'EE42/21/20',
                Ae: 1.81,
                Ve: 11.2,
                le: 9.8,
                window: 2.84,
                materialId: 'pc95'
            }
        ];
        this.magneticMaterials = [
            {
                id: 'n87',
                name: 'N87',
                steinmetzK: 0.0039,
                alpha: 1.35,
                beta: 2.3,
                freqRange: [25000, 200000]
            },
            {
                id: 'pc95',
                name: 'PC95',
                steinmetzK: 0.0021,
                alpha: 1.28,
                beta: 2.1,
                freqRange: [50000, 500000]
            }
        ];
        this.deviceCurves = [
            {
                id: 'dev-1',
                partNumber: 'C2M0080120D',
                technology: 'SiC',
                vds: 1200,
                idMax: 36,
                rdsOn25C: 0.080,
                rthJC: 0.24,
                curves: {
                    eon: [[0, 10], [20, 12], [40, 15]],
                    eoff: [[0, 8], [20, 10], [40, 13]],
                    qg: [[0, 0], [5, 28], [10, 35]],
                    coss: [[0, 320], [400, 180], [800, 120]],
                    rdsOnTemp: [[25, 1.0], [75, 1.3], [125, 1.6]]
                }
            },
            {
                id: 'dev-2',
                partNumber: 'GS-065-011-1-L',
                technology: 'GaN',
                vds: 650,
                idMax: 11,
                rdsOn25C: 0.025,
                rthJC: 0.5,
                curves: {
                    eon: [[0, 2], [5, 3], [10, 4]],
                    eoff: [[0, 1], [5, 2], [10, 3]],
                    qg: [[0, 0], [3, 8], [6, 12]],
                    coss: [[0, 280], [200, 150], [400, 90]],
                    rdsOnTemp: [[25, 1.0], [75, 1.4], [125, 1.8]]
                }
            }
        ];
    }
    async createSstDesign(design) {
        const id = `sst-${Date.now()}`;
        const newDesign = { ...design, id };
        this.sstDesigns.set(id, newDesign);
        return newDesign;
    }
    async getSstDesign(id) {
        return this.sstDesigns.get(id) || null;
    }
    async getSstDesigns() {
        return Array.from(this.sstDesigns.values());
    }
    async getTransformerCores() {
        return this.transformerCores;
    }
    async getMagneticMaterials() {
        return this.magneticMaterials;
    }
    async getDeviceCurves() {
        return this.deviceCurves;
    }
    async simulateSst(design) {
        const efficiency = 94.5 + Math.random() * 2;
        const zvsMargin = 15 + Math.random() * 10;
        const coreLoss = 20 + Math.random() * 10;
        const switchingLoss = 15 + Math.random() * 8;
        return {
            efficiency,
            zvsMargin,
            coreLoss,
            switchingLoss,
            thermalMap: [
                { component: 'Primary Switch', temperature: 45 + Math.random() * 20 },
                { component: 'Secondary Switch', temperature: 42 + Math.random() * 18 },
                { component: 'MFT Core', temperature: 35 + Math.random() * 15 },
                { component: 'MFT Winding', temperature: 38 + Math.random() * 12 }
            ]
        };
    }
    async optimizeSst(constraints) {
        return {
            frequency: 50000 + Math.random() * 100000,
            phaseShift: 15 + Math.random() * 30,
            deviceRecommendation: Math.random() > 0.5 ? 'C2M0080120D' : 'GS-065-011-1-L',
            efficiency: constraints.targetEfficiency - 1 + Math.random() * 2
        };
    }
};
exports.SstService = SstService;
exports.SstService = SstService = __decorate([
    (0, common_1.Injectable)()
], SstService);
//# sourceMappingURL=sst.service.js.map