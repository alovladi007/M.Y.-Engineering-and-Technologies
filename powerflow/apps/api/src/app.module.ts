import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SimulationModule } from './simulation/simulation.module';
import { HardwareModule } from './hardware/hardware.module';
import { WebSocketModule } from './websocket/websocket.module';
import { SstModule } from './sst/sst.module';
import { BillingModule } from './billing/billing.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    SimulationModule,
    HardwareModule,
    WebSocketModule,
    SstModule,
    BillingModule,
  ],
})
export class AppModule {}