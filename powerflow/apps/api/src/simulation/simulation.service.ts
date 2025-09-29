import { Injectable } from '@nestjs/common';
import { CreateSimulationDto } from './dto/create-simulation.dto';
import { UpdateSimulationDto } from './dto/update-simulation.dto';

@Injectable()
export class SimulationService {
  private simulations = new Map();
  private simulationStates = new Map();

  create(createSimulationDto: CreateSimulationDto) {
    const id = Date.now().toString();
    const simulation = {
      id,
      ...createSimulationDto,
      status: 'idle',
      createdAt: new Date(),
    };
    this.simulations.set(id, simulation);
    return simulation;
  }

  findAll() {
    return Array.from(this.simulations.values());
  }

  findOne(id: string) {
    return this.simulations.get(id);
  }

  update(id: string, updateSimulationDto: UpdateSimulationDto) {
    const simulation = this.simulations.get(id);
    if (simulation) {
      Object.assign(simulation, updateSimulationDto);
      return simulation;
    }
    return null;
  }

  remove(id: string) {
    return this.simulations.delete(id);
  }

  start(id: string) {
    const simulation = this.simulations.get(id);
    if (simulation) {
      simulation.status = 'running';
      this.simulationStates.set(id, { startTime: Date.now() });
      
      // Simulate data generation
      const interval = setInterval(() => {
        const state = this.simulationStates.get(id);
        if (!state || simulation.status !== 'running') {
          clearInterval(interval);
          return;
        }
        
        // Generate simulation data
        state.currentData = {
          time: Date.now() - state.startTime,
          voltage: 12 + Math.sin(Date.now() / 1000) * 2,
          current: 10 + Math.random() * 2,
          power: 120 + Math.random() * 20,
          efficiency: 0.94 + Math.random() * 0.02,
        };
      }, 100);
      
      return { message: 'Simulation started', id };
    }
    return { error: 'Simulation not found' };
  }

  stop(id: string) {
    const simulation = this.simulations.get(id);
    if (simulation) {
      simulation.status = 'stopped';
      return { message: 'Simulation stopped', id };
    }
    return { error: 'Simulation not found' };
  }

  getResults(id: string) {
    const state = this.simulationStates.get(id);
    return state?.currentData || { message: 'No results available' };
  }
}