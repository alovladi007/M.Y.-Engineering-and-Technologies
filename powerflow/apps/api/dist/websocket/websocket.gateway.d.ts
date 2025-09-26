import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class WebSocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private logger;
    afterInit(server: Server): void;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleSimulationControl(client: Socket, payload: any): {
        event: string;
        data: any;
    };
    handleHardwareControl(client: Socket, payload: any): {
        event: string;
        data: any;
    };
}
