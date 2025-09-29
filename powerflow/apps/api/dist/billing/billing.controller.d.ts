import { BillingService, Plan, Usage, Invoice } from './billing.service';
declare class CreateCheckoutDto {
    planId: string;
    orgId: string;
}
declare class WebhookDto {
    type: string;
    data: any;
}
export declare class BillingController {
    private readonly billingService;
    constructor(billingService: BillingService);
    getPlans(): Promise<Plan[]>;
    getPlan(id: string): Promise<Plan>;
    getUsage(orgId: string): Promise<Usage>;
    getInvoices(orgId: string): Promise<Invoice[]>;
    createCheckout(createCheckoutDto: CreateCheckoutDto): Promise<{
        sessionId: string;
        url: string;
    }>;
    createPortal(orgId: string): Promise<{
        url: string;
    }>;
    handleWebhook(webhookDto: WebhookDto): Promise<void>;
    checkQuotas(orgId: string, planId: string): Promise<{
        withinLimits: boolean;
        limits: any;
        current: Usage;
    }>;
}
export {};
