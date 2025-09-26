import {
  WebSocketGateway as WSGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WSGateway({
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
})
export class WebSocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('WebSocketGateway');

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    
    // Start sending real-time data
    const interval = setInterval(() => {
      client.emit('realtime-data', {
        timestamp: new Date(),
        voltage: 12 + Math.sin(Date.now() / 1000) * 2,
        current: 10 + Math.random() * 2,
        power: 120 + Math.random() * 20,
        efficiency: 0.94 + Math.random() * 0.02,
        temperature: 45 + Math.random() * 5,
      });
    }, 1000);

    client.on('disconnect', () => {
      clearInterval(interval);
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('simulation-control')
  handleSimulationControl(client: Socket, payload: any) {
    this.logger.log(`Simulation control: ${JSON.stringify(payload)}`);
    return { event: 'simulation-status', data: payload };
  }

  @SubscribeMessage('hardware-control')
  handleHardwareControl(client: Socket, payload: any) {
    this.logger.log(`Hardware control: ${JSON.stringify(payload)}`);
    return { event: 'hardware-status', data: payload };
  }
}