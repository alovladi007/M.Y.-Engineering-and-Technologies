"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const billing_service_1 = require("./billing.service");
class CreateCheckoutDto {
}
class WebhookDto {
}
let BillingController = class BillingController {
    constructor(billingService) {
        this.billingService = billingService;
    }
    async getPlans() {
        return await this.billingService.getPlans();
    }
    async getPlan(id) {
        const plan = await this.billingService.getPlan(id);
        if (!plan) {
            throw new common_1.HttpException('Plan not found', common_1.HttpStatus.NOT_FOUND);
        }
        return plan;
    }
    async getUsage(orgId) {
        const usage = await this.billingService.getUsage(orgId);
        if (!usage) {
            throw new common_1.HttpException('Usage not found', common_1.HttpStatus.NOT_FOUND);
        }
        return usage;
    }
    async getInvoices(orgId) {
        return await this.billingService.getInvoices(orgId);
    }
    async createCheckout(createCheckoutDto) {
        return await this.billingService.createCheckoutSession(createCheckoutDto.orgId, createCheckoutDto.planId);
    }
    async createPortal(orgId) {
        return await this.billingService.createPortalSession(orgId);
    }
    async handleWebhook(webhookDto) {
        await this.billingService.handleWebhook(webhookDto);
    }
    async checkQuotas(orgId, planId) {
        return await this.billingService.checkQuotas(orgId, planId || 'free');
    }
};
exports.BillingController = BillingController;
__decorate([
    (0, common_1.Get)('plans'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all billing plans' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of billing plans' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "getPlans", null);
__decorate([
    (0, common_1.Get)('plans/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get plan by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Plan details' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Plan not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "getPlan", null);
__decorate([
    (0, common_1.Get)('usage/:orgId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get usage for organization' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Usage details' }),
    __param(0, (0, common_1.Param)('orgId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "getUsage", null);
__decorate([
    (0, common_1.Get)('invoices/:orgId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get invoices for organization' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of invoices' }),
    __param(0, (0, common_1.Param)('orgId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "getInvoices", null);
__decorate([
    (0, common_1.Post)('checkout'),
    (0, swagger_1.ApiOperation)({ summary: 'Create Stripe checkout session' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Checkout session created' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateCheckoutDto]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "createCheckout", null);
__decorate([
    (0, common_1.Post)('portal/:orgId'),
    (0, swagger_1.ApiOperation)({ summary: 'Create Stripe customer portal session' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Portal session created' }),
    __param(0, (0, common_1.Param)('orgId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "createPortal", null);
__decorate([
    (0, common_1.Post)('webhook'),
    (0, swagger_1.ApiOperation)({ summary: 'Handle Stripe webhook' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Webhook processed' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [WebhookDto]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "handleWebhook", null);
__decorate([
    (0, common_1.Get)('quotas/:orgId'),
    (0, swagger_1.ApiOperation)({ summary: 'Check quotas for organization' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Quota status' }),
    __param(0, (0, common_1.Param)('orgId')),
    __param(1, (0, common_1.Query)('planId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "checkQuotas", null);
exports.BillingController = BillingController = __decorate([
    (0, swagger_1.ApiTags)('Billing'),
    (0, common_1.Controller)('billing'),
    __metadata("design:paramtypes", [billing_service_1.BillingService])
], BillingController);
//# sourceMappingURL=billing.controller.js.map