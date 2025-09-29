import { SstService, SstDesign, TransformerCore, MagneticMaterial, DeviceCurve } from './sst.service';
declare class CreateSstDesignDto {
    projectId: string;
    stageChain: string[];
    mft: {
        coreId: string;
        primaryTurns: number;
        secondaryTurns: number;
        frequency: number;
    };
    constraints: {
        maxPower: number;
        efficiency: number;
        zvs: boolean;
    };
}
declare class OptimizeSstDto {
    targetEfficiency: number;
    maxPower: number;
    zvs: boolean;
}
export declare class SstController {
    private readonly sstService;
    constructor(sstService: SstService);
    createDesign(createSstDesignDto: CreateSstDesignDto): Promise<SstDesign>;
    getDesigns(): Promise<SstDesign[]>;
    getDesign(id: string): Promise<SstDesign>;
    getCores(): Promise<TransformerCore[]>;
    getMaterials(): Promise<MagneticMaterial[]>;
    getDevices(): Promise<DeviceCurve[]>;
    simulate(design: CreateSstDesignDto): Promise<{
        efficiency: number;
        zvsMargin: number;
        coreLoss: number;
        switchingLoss: number;
        thermalMap: {
            component: string;
            temperature: number;
        }[];
    }>;
    optimize(constraints: OptimizeSstDto): Promise<{
        frequency: number;
        phaseShift: number;
        deviceRecommendation: string;
        efficiency: number;
    }>;
}
export {};
