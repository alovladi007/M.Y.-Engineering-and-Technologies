import { Controller, Get, Post, Body, Param, Query, HttpStatus, HttpException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BillingService, Plan, Usage, Invoice } from './billing.service';

class CreateCheckoutDto {
  planId: string;
  orgId: string;
}

class WebhookDto {
  type: string;
  data: any;
}

@ApiTags('Billing')
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('plans')
  @ApiOperation({ summary: 'Get all billing plans' })
  @ApiResponse({ status: 200, description: 'List of billing plans' })
  async getPlans(): Promise<Plan[]> {
    return await this.billingService.getPlans();
  }

  @Get('plans/:id')
  @ApiOperation({ summary: 'Get plan by ID' })
  @ApiResponse({ status: 200, description: 'Plan details' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  async getPlan(@Param('id') id: string): Promise<Plan> {
    const plan = await this.billingService.getPlan(id);
    if (!plan) {
      throw new HttpException('Plan not found', HttpStatus.NOT_FOUND);
    }
    return plan;
  }

  @Get('usage/:orgId')
  @ApiOperation({ summary: 'Get usage for organization' })
  @ApiResponse({ status: 200, description: 'Usage details' })
  async getUsage(@Param('orgId') orgId: string): Promise<Usage> {
    const usage = await this.billingService.getUsage(orgId);
    if (!usage) {
      throw new HttpException('Usage not found', HttpStatus.NOT_FOUND);
    }
    return usage;
  }

  @Get('invoices/:orgId')
  @ApiOperation({ summary: 'Get invoices for organization' })
  @ApiResponse({ status: 200, description: 'List of invoices' })
  async getInvoices(@Param('orgId') orgId: string): Promise<Invoice[]> {
    return await this.billingService.getInvoices(orgId);
  }

  @Post('checkout')
  @ApiOperation({ summary: 'Create Stripe checkout session' })
  @ApiResponse({ status: 201, description: 'Checkout session created' })
  async createCheckout(@Body() createCheckoutDto: CreateCheckoutDto): Promise<{
    sessionId: string;
    url: string;
  }> {
    return await this.billingService.createCheckoutSession(
      createCheckoutDto.orgId,
      createCheckoutDto.planId
    );
  }

  @Post('portal/:orgId')
  @ApiOperation({ summary: 'Create Stripe customer portal session' })
  @ApiResponse({ status: 201, description: 'Portal session created' })
  async createPortal(@Param('orgId') orgId: string): Promise<{
    url: string;
  }> {
    return await this.billingService.createPortalSession(orgId);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Handle Stripe webhook' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  async handleWebhook(@Body() webhookDto: WebhookDto): Promise<void> {
    await this.billingService.handleWebhook(webhookDto);
  }

  @Get('quotas/:orgId')
  @ApiOperation({ summary: 'Check quotas for organization' })
  @ApiResponse({ status: 200, description: 'Quota status' })
  async checkQuotas(
    @Param('orgId') orgId: string,
    @Query('planId') planId: string
  ): Promise<{
    withinLimits: boolean;
    limits: any;
    current: Usage;
  }> {
    return await this.billingService.checkQuotas(orgId, planId || 'free');
  }
}