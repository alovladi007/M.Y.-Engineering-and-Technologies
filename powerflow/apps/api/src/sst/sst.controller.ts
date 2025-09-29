import { Controller, Get, Post, Body, Param, HttpStatus, HttpException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SstService, SstDesign, TransformerCore, MagneticMaterial, DeviceCurve } from './sst.service';

class CreateSstDesignDto {
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

class OptimizeSstDto {
  targetEfficiency: number;
  maxPower: number;
  zvs: boolean;
}

@ApiTags('SST')
@Controller('sst')
export class SstController {
  constructor(private readonly sstService: SstService) {}

  @Post('designs')
  @ApiOperation({ summary: 'Create a new SST design' })
  @ApiResponse({ status: 201, description: 'SST design created successfully' })
  async createDesign(@Body() createSstDesignDto: CreateSstDesignDto): Promise<SstDesign> {
    try {
      return await this.sstService.createSstDesign(createSstDesignDto);
    } catch (error) {
      throw new HttpException('Failed to create SST design', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('designs')
  @ApiOperation({ summary: 'Get all SST designs' })
  @ApiResponse({ status: 200, description: 'List of SST designs' })
  async getDesigns(): Promise<SstDesign[]> {
    return await this.sstService.getSstDesigns();
  }

  @Get('designs/:id')
  @ApiOperation({ summary: 'Get SST design by ID' })
  @ApiResponse({ status: 200, description: 'SST design details' })
  @ApiResponse({ status: 404, description: 'SST design not found' })
  async getDesign(@Param('id') id: string): Promise<SstDesign> {
    const design = await this.sstService.getSstDesign(id);
    if (!design) {
      throw new HttpException('SST design not found', HttpStatus.NOT_FOUND);
    }
    return design;
  }

  @Get('cores')
  @ApiOperation({ summary: 'Get transformer cores' })
  @ApiResponse({ status: 200, description: 'List of transformer cores' })
  async getCores(): Promise<TransformerCore[]> {
    return await this.sstService.getTransformerCores();
  }

  @Get('materials')
  @ApiOperation({ summary: 'Get magnetic materials' })
  @ApiResponse({ status: 200, description: 'List of magnetic materials' })
  async getMaterials(): Promise<MagneticMaterial[]> {
    return await this.sstService.getMagneticMaterials();
  }

  @Get('devices')
  @ApiOperation({ summary: 'Get device curves' })
  @ApiResponse({ status: 200, description: 'List of device curves' })
  async getDevices(): Promise<DeviceCurve[]> {
    return await this.sstService.getDeviceCurves();
  }

  @Post('simulate')
  @ApiOperation({ summary: 'Simulate SST design' })
  @ApiResponse({ status: 200, description: 'Simulation results' })
  async simulate(@Body() design: CreateSstDesignDto) {
    const fullDesign = await this.sstService.createSstDesign(design);
    return await this.sstService.simulateSst(fullDesign);
  }

  @Post('optimize')
  @ApiOperation({ summary: 'Optimize SST design' })
  @ApiResponse({ status: 200, description: 'Optimization results' })
  async optimize(@Body() constraints: OptimizeSstDto) {
    return await this.sstService.optimizeSst(constraints);
  }
}