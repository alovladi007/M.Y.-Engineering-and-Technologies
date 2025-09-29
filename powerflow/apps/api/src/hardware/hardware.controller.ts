import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { HardwareService } from './hardware.service';

@ApiTags('hardware')
@Controller('hardware')
export class HardwareController {
  constructor(private readonly hardwareService: HardwareService) {}

  @Get('devices')
  @ApiOperation({ summary: 'Get all connected devices' })
  getDevices() {
    return this.hardwareService.getDevices();
  }

  @Get('devices/:id')
  @ApiOperation({ summary: 'Get device by ID' })
  getDevice(@Param('id') id: string) {
    return this.hardwareService.getDevice(id);
  }

  @Post('devices/:id/connect')
  @ApiOperation({ summary: 'Connect to device' })
  connectDevice(@Param('id') id: string) {
    return this.hardwareService.connectDevice(id);
  }

  @Post('devices/:id/disconnect')
  @ApiOperation({ summary: 'Disconnect from device' })
  disconnectDevice(@Param('id') id: string) {
    return this.hardwareService.disconnectDevice(id);
  }

  @Get('devices/:id/data')
  @ApiOperation({ summary: 'Get real-time data from device' })
  getDeviceData(@Param('id') id: string) {
    return this.hardwareService.getDeviceData(id);
  }

  @Post('devices/:id/command')
  @ApiOperation({ summary: 'Send command to device' })
  sendCommand(@Param('id') id: string, @Body() command: any) {
    return this.hardwareService.sendCommand(id, command);
  }
}