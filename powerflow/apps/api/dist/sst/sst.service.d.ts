export interface SstDesign {
    id: string;
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
export interface TransformerCore {
    id: string;
    vendor: string;
    coreType: string;
    Ae: number;
    Ve: number;
    le: number;
    window: number;
    materialId: string;
}
export interface MagneticMaterial {
    id: string;
    name: string;
    steinmetzK: number;
    alpha: number;
    beta: number;
    freqRange: [number, number];
}
export interface DeviceCurve {
    id: string;
    partNumber: string;
    technology: 'SiC' | 'GaN';
    vds: number;
    idMax: number;
    rdsOn25C: number;
    rthJC: number;
    curves: {
        eon: number[][];
        eoff: number[][];
        qg: number[][];
        coss: number[][];
        rdsOnTemp: number[][];
    };
}
export declare class SstService {
    private sstDesigns;
    private transformerCores;
    private magneticMaterials;
    private deviceCurves;
    createSstDesign(design: Omit<SstDesign, 'id'>): Promise<SstDesign>;
    getSstDesign(id: string): Promise<SstDesign | null>;
    getSstDesigns(): Promise<SstDesign[]>;
    getTransformerCores(): Promise<TransformerCore[]>;
    getMagneticMaterials(): Promise<MagneticMaterial[]>;
    getDeviceCurves(): Promise<DeviceCurve[]>;
    simulateSst(design: SstDesign): Promise<{
        efficiency: number;
        zvsMargin: number;
        coreLoss: number;
        switchingLoss: number;
        thermalMap: {
            component: string;
            temperature: number;
        }[];
    }>;
    optimizeSst(constraints: {
        targetEfficiency: number;
        maxPower: number;
        zvs: boolean;
    }): Promise<{
        frequency: number;
        phaseShift: number;
        deviceRecommendation: string;
        efficiency: number;
    }>;
}
