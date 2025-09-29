"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimulationService = void 0;
const common_1 = require("@nestjs/common");
let SimulationService = class SimulationService {
    constructor() {
        this.simulations = new Map();
        this.simulationStates = new Map();
    }
    create(createSimulationDto) {
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
    findOne(id) {
        return this.simulations.get(id);
    }
    update(id, updateSimulationDto) {
        const simulation = this.simulations.get(id);
        if (simulation) {
            Object.assign(simulation, updateSimulationDto);
            return simulation;
        }
        return null;
    }
    remove(id) {
        return this.simulations.delete(id);
    }
    start(id) {
        const simulation = this.simulations.get(id);
        if (simulation) {
            simulation.status = 'running';
            this.simulationStates.set(id, { startTime: Date.now() });
            const interval = setInterval(() => {
                const state = this.simulationStates.get(id);
                if (!state || simulation.status !== 'running') {
                    clearInterval(interval);
                    return;
                }
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
    stop(id) {
        const simulation = this.simulations.get(id);
        if (simulation) {
            simulation.status = 'stopped';
            return { message: 'Simulation stopped', id };
        }
        return { error: 'Simulation not found' };
    }
    getResults(id) {
        const state = this.simulationStates.get(id);
        return state?.currentData || { message: 'No results available' };
    }
};
exports.SimulationService = SimulationService;
exports.SimulationService = SimulationService = __decorate([
    (0, common_1.Injectable)()
], SimulationService);
//# sourceMappingURL=simulation.service.js.map