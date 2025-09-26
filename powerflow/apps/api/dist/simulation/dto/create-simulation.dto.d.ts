export declare class CreateSimulationDto {
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
}
