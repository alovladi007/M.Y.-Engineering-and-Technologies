import { Injectable } from '@nestjs/common';

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

@Injectable()
export class BillingService {
  private plans: Plan[] = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      currency: 'USD',
      interval: 'month',
      features: [
        'Basic simulation kernels',
        'Limited HIL access',
        'Community support'
      ],
      limits: {
        simMinutes: 200,
        devices: 1,
        projects: 1,
        telemetryGB: 5,
        sstDesigns: 2
      }
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 99,
      currency: 'USD',
      interval: 'month',
      features: [
        'Advanced simulation kernels',
        'SST design tools',
        'ML optimization',
        'Priority support',
        'Data export'
      ],
      limits: {
        simMinutes: 5000,
        devices: 5,
        projects: 20,
        telemetryGB: 200,
        sstDesigns: 50
      }
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 499,
      currency: 'USD',
      interval: 'month',
      features: [
        'Unlimited simulations',
        'SST design & optimization',
        'CCS/OCPP conformance',
        'Data-center energy OS',
        'SAML/SCIM',
        'VPC peering',
        'Dedicated support'
      ],
      limits: {
        simMinutes: -1, // unlimited
        devices: -1,
        projects: -1,
        telemetryGB: -1,
        sstDesigns: -1
      }
    }
  ];

  private usage: Map<string, Usage> = new Map([
    ['org-1', {
      orgId: 'org-1',
      period: '2025-09',
      simMinutes: 127,
      devices: 1,
      projects: 3,
      telemetryGB: 2.4,
      sstDesigns: 1
    }]
  ]);

  private invoices: Map<string, Invoice> = new Map([
    ['inv-1', {
      id: 'inv-1',
      orgId: 'org-1',
      amount: 99.00,
      currency: 'USD',
      status: 'paid',
      dueDate: '2025-09-30',
      items: [
        {
          description: 'Pro Plan - September 2025',
          quantity: 1,
          unitPrice: 99.00,
          total: 99.00
        }
      ]
    }]
  ]);

  async getPlans(): Promise<Plan[]> {
    return this.plans;
  }

  async getPlan(planId: string): Promise<Plan | null> {
    return this.plans.find(p => p.id === planId) || null;
  }

  async getUsage(orgId: string): Promise<Usage | null> {
    return this.usage.get(orgId) || null;
  }

  async getInvoices(orgId: string): Promise<Invoice[]> {
    return Array.from(this.invoices.values()).filter(inv => inv.orgId === orgId);
  }

  async createCheckoutSession(orgId: string, planId: string): Promise<{
    sessionId: string;
    url: string;
  }> {
    // Mock Stripe checkout session creation
    const sessionId = `cs_${Date.now()}`;
    const url = `https://checkout.stripe.com/pay/${sessionId}`;
    
    return {
      sessionId,
      url
    };
  }

  async createPortalSession(orgId: string): Promise<{
    url: string;
  }> {
    // Mock Stripe customer portal session
    const url = `https://billing.stripe.com/session/${Date.now()}`;
    
    return { url };
  }

  async handleWebhook(event: any): Promise<void> {
    // Mock webhook handling
    console.log('Webhook received:', event.type);
    
    switch (event.type) {
      case 'checkout.session.completed':
        console.log('Checkout session completed');
        break;
      case 'invoice.payment_succeeded':
        console.log('Invoice payment succeeded');
        break;
      case 'customer.subscription.updated':
        console.log('Subscription updated');
        break;
      default:
        console.log(`Unhandled webhook event: ${event.type}`);
    }
  }

  async checkQuotas(orgId: string, planId: string): Promise<{
    withinLimits: boolean;
    limits: Plan['limits'];
    current: Usage;
  }> {
    const plan = await this.getPlan(planId);
    const usage = await this.getUsage(orgId);
    
    if (!plan || !usage) {
      return {
        withinLimits: false,
        limits: { simMinutes: 0, devices: 0, projects: 0, telemetryGB: 0, sstDesigns: 0 },
        current: { orgId, period: '', simMinutes: 0, devices: 0, projects: 0, telemetryGB: 0, sstDesigns: 0 }
      };
    }

    const withinLimits = (
      (plan.limits.simMinutes === -1 || usage.simMinutes <= plan.limits.simMinutes) &&
      (plan.limits.devices === -1 || usage.devices <= plan.limits.devices) &&
      (plan.limits.projects === -1 || usage.projects <= plan.limits.projects) &&
      (plan.limits.telemetryGB === -1 || usage.telemetryGB <= plan.limits.telemetryGB) &&
      (plan.limits.sstDesigns === -1 || usage.sstDesigns <= plan.limits.sstDesigns)
    );

    return {
      withinLimits,
      limits: plan.limits,
      current: usage
    };
  }
}