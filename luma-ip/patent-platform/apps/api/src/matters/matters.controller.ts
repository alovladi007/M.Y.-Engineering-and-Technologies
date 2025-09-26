import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MattersService } from './matters.service';
import { CreateMatterDto } from './dto/create-matter.dto';

@ApiTags('matters')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('matters')
export class MattersController {
  constructor(private mattersService: MattersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new matter' })
  async create(@Req() req: any, @Body() createMatterDto: CreateMatterDto) {
    return this.mattersService.create(
      req.user.id,
      req.user.organizationId,
      createMatterDto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all matters for organization' })
  async findAll(@Req() req: any) {
    return this.mattersService.findAll(req.user.organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get matter details' })
  async findOne(@Param('id') id: string) {
    return this.mattersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update matter' })
  async update(@Param('id') id: string, @Body() updateData: any) {
    return this.mattersService.update(id, updateData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete matter' })
  async delete(@Param('id') id: string) {
    return this.mattersService.delete(id);
  }
}