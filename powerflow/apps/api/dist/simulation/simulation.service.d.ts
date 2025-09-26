import { CreateSimulationDto } from './dto/create-simulation.dto';
import { UpdateSimulationDto } from './dto/update-simulation.dto';
export declare class SimulationService {
    private simulations;
    private simulationStates;
    create(createSimulationDto: CreateSimulationDto): {
        status: string;
        createdAt: Date;
        name: string;
        type: string;
        description?: string;
        parameters: {
            inputVoltage?: number;
            outputVoltage?: number;
            switchingFrequency?: number;
            controlMethod?: string;
        };
        config?: any;
        id: string;
    };
    findAll(): any[];
    findOne(id: string): any;
    update(id: string, updateSimulationDto: UpdateSimulationDto): any;
    remove(id: string): boolean;
    start(id: string): {
        message: string;
        id: string;
        error?: undefined;
    } | {
        error: string;
        message?: undefined;
        id?: undefined;
    };
    stop(id: string): {
        message: string;
        id: string;
        error?: undefined;
    } | {
        error: string;
        message?: undefined;
        id?: undefined;
    };
    getResults(id: string): any;
}
