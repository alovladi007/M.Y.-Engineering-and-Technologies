import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SimulationService } from './simulation.service';
import { CreateSimulationDto } from './dto/create-simulation.dto';
import { UpdateSimulationDto } from './dto/update-simulation.dto';

@ApiTags('simulations')
@Controller('simulations')
export class SimulationController {
  constructor(private readonly simulationService: SimulationService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new simulation' })
  create(@Body() createSimulationDto: CreateSimulationDto) {
    return this.simulationService.create(createSimulationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all simulations' })
  findAll() {
    return this.simulationService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get simulation by ID' })
  findOne(@Param('id') id: string) {
    return this.simulationService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update simulation' })
  update(@Param('id') id: string, @Body() updateSimulationDto: UpdateSimulationDto) {
    return this.simulationService.update(id, updateSimulationDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete simulation' })
  remove(@Param('id') id: string) {
    return this.simulationService.remove(id);
  }

  @Post(':id/start')
  @ApiOperation({ summary: 'Start simulation' })
  start(@Param('id') id: string) {
    return this.simulationService.start(id);
  }

  @Post(':id/stop')
  @ApiOperation({ summary: 'Stop simulation' })
  stop(@Param('id') id: string) {
    return this.simulationService.stop(id);
  }

  @Get(':id/results')
  @ApiOperation({ summary: 'Get simulation results' })
  getResults(@Param('id') id: string) {
    return this.simulationService.getResults(id);
  }
}