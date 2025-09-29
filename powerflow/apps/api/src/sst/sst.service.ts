import { Injectable } from '@nestjs/common';

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
  Ae: number; // Effective area (cm²)
  Ve: number; // Effective volume (cm³)
  le: number; // Effective length (cm)
  window: number; // Window area (cm²)
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

@Injectable()
export class SstService {
  private sstDesigns: Map<string, SstDesign> = new Map();
  private transformerCores: TransformerCore[] = [
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

  private magneticMaterials: MagneticMaterial[] = [
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

  private deviceCurves: DeviceCurve[] = [
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

  async createSstDesign(design: Omit<SstDesign, 'id'>): Promise<SstDesign> {
    const id = `sst-${Date.now()}`;
    const newDesign = { ...design, id };
    this.sstDesigns.set(id, newDesign);
    return newDesign;
  }

  async getSstDesign(id: string): Promise<SstDesign | null> {
    return this.sstDesigns.get(id) || null;
  }

  async getSstDesigns(): Promise<SstDesign[]> {
    return Array.from(this.sstDesigns.values());
  }

  async getTransformerCores(): Promise<TransformerCore[]> {
    return this.transformerCores;
  }

  async getMagneticMaterials(): Promise<MagneticMaterial[]> {
    return this.magneticMaterials;
  }

  async getDeviceCurves(): Promise<DeviceCurve[]> {
    return this.deviceCurves;
  }

  async simulateSst(design: SstDesign): Promise<{
    efficiency: number;
    zvsMargin: number;
    coreLoss: number;
    switchingLoss: number;
    thermalMap: { component: string; temperature: number }[];
  }> {
    // Mock SST simulation results
    const efficiency = 94.5 + Math.random() * 2; // 94.5-96.5%
    const zvsMargin = 15 + Math.random() * 10; // 15-25%
    const coreLoss = 20 + Math.random() * 10; // 20-30W
    const switchingLoss = 15 + Math.random() * 8; // 15-23W

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

  async optimizeSst(constraints: {
    targetEfficiency: number;
    maxPower: number;
    zvs: boolean;
  }): Promise<{
    frequency: number;
    phaseShift: number;
    deviceRecommendation: string;
    efficiency: number;
  }> {
    // Mock optimization results
    return {
      frequency: 50000 + Math.random() * 100000, // 50-150 kHz
      phaseShift: 15 + Math.random() * 30, // 15-45 degrees
      deviceRecommendation: Math.random() > 0.5 ? 'C2M0080120D' : 'GS-065-011-1-L',
      efficiency: constraints.targetEfficiency - 1 + Math.random() * 2
    };
  }
}