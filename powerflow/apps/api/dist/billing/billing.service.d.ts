export interface Plan {
    id: string;
    name: string;
    price: number;
    currency: string;
    interval: 'month' | 'year';
    features: string[];
    limits: {
        simMinutes: number;
        devices: number;
        projects: number;
        telemetryGB: number;
        sstDesigns: number;
    };
}
export interface Usage {
    orgId: string;
    period: string;
    simMinutes: number;
    devices: number;
    projects: number;
    telemetryGB: number;
    sstDesigns: number;
}
export interface Invoice {
    id: string;
    orgId: string;
    amount: number;
    currency: string;
    status: 'pending' | 'paid' | 'failed';
    dueDate: string;
    items: {
        description: string;
        quantity: number;
        unitPrice: number;
        total: number;
    }[];
}
export declare class BillingService {
    private plans;
    private usage;
    private invoices;
    getPlans(): Promise<Plan[]>;
    getPlan(planId: string): Promise<Plan | null>;
    getUsage(orgId: string): Promise<Usage | null>;
    getInvoices(orgId: string): Promise<Invoice[]>;
    createCheckoutSession(orgId: string, planId: string): Promise<{
        sessionId: string;
        url: string;
    }>;
    createPortalSession(orgId: string): Promise<{
        url: string;
    }>;
    handleWebhook(event: any): Promise<void>;
    checkQuotas(orgId: string, planId: string): Promise<{
        withinLimits: boolean;
        limits: Plan['limits'];
        current: Usage;
    }>;
}
