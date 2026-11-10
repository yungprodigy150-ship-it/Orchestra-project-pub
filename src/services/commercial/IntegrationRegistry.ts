/**
 * ORCHESTRA Stage 5: Commercial Integration Registry
 * Tracks external communication, CRM, social, analytics, and advertising connectors
 * with accurate configuration statuses and human permission gates.
 */

import { CommercialIntegrationConnector, CommercialIntegrationStatus } from '../../types/commercial';

export const DEFAULT_INTEGRATION_CONNECTORS: CommercialIntegrationConnector[] = [
  {
    id: 'conn-email-resend',
    name: 'Email Gateway (Resend / SendGrid)',
    category: 'email',
    description: 'Transaction and personalized prospect dispatch. Inbound bounce and reply tracking.',
    status: 'NOT_CONFIGURED',
    requiredEnvVar: 'EMAIL_DISPATCH_API_KEY',
    isAvailable: false,
    capabilities: ['Draft Email Verification', 'Templated Delivery', 'Reply Thread Tracking'],
    configNotes: 'Outreach Assistant drafts are held in approval queue until verified connection.'
  },
  {
    id: 'conn-crm-hubspot',
    name: 'Enterprise CRM Sync (HubSpot / Salesforce)',
    category: 'crm',
    description: 'Bi-directional account synchronization, lead scoring updates, and deal stage automation.',
    status: 'NOT_CONFIGURED',
    requiredEnvVar: 'CRM_INTEGRATION_TOKEN',
    isAvailable: false,
    capabilities: ['Deal Pipeline Sync', 'Contact Enrichment', 'Lifecycle Stage Push'],
    configNotes: 'Internal Lightweight CRM functions locally with full export capability.'
  },
  {
    id: 'conn-social-linkedin',
    name: 'LinkedIn Direct & Developer Relations',
    category: 'social',
    description: 'B2B social distribution and direct inMail draft queuing for engineering leadership.',
    status: 'NOT_CONFIGURED',
    requiredEnvVar: 'LINKEDIN_CLIENT_SECRET',
    isAvailable: false,
    capabilities: ['Post Syndication', 'Message Draft Queuing', 'Follower Analytics'],
    configNotes: 'Zero autonomous posting allowed without explicit human approval.'
  },
  {
    id: 'conn-analytics-posthog',
    name: 'Product Analytics (PostHog / Mixpanel)',
    category: 'analytics',
    description: 'Real user session telemetry, product funnel metrics, and feature retention tracking.',
    status: 'NOT_CONFIGURED',
    requiredEnvVar: 'PRODUCT_ANALYTICS_KEY',
    isAvailable: false,
    capabilities: ['Funnel Conversion Audits', 'Active User Retention', 'Feature Usage Tracking'],
    configNotes: 'Growth Analyst distinguishes measured telemetry from AI estimates.'
  },
  {
    id: 'conn-ads-google',
    name: 'Developer Search Ads (Google Ads)',
    category: 'advertising',
    description: 'Targeted high-intent developer query advertising and CPC budget tracking.',
    status: 'NOT_CONFIGURED',
    requiredEnvVar: 'GOOGLE_ADS_DEVELOPER_TOKEN',
    isAvailable: false,
    capabilities: ['Campaign Budget Auditing', 'Search Query Ingestion', 'Ad Copy Staging'],
    configNotes: 'Requires explicit financial signoff before enabling live bidding.'
  },
  {
    id: 'conn-payments-stripe',
    name: 'Commercial Revenue (Stripe)',
    category: 'payment',
    description: 'Subscription billing, MRR metrics, contract invoices, and payment failure alerts.',
    status: 'NOT_CONFIGURED',
    requiredEnvVar: 'STRIPE_RESTRICTED_KEY',
    isAvailable: false,
    capabilities: ['Invoice Verification', 'MRR Reporting', 'Churn Tracking'],
    configNotes: 'Financial telemetry ingested directly into Portfolio Strategist models.'
  }
];

export class IntegrationRegistry {
  private connectors: Map<string, CommercialIntegrationConnector> = new Map();

  constructor(initial: CommercialIntegrationConnector[] = DEFAULT_INTEGRATION_CONNECTORS) {
    initial.forEach(c => this.connectors.set(c.id, { ...c }));
  }

  public listConnectors(): CommercialIntegrationConnector[] {
    return Array.from(this.connectors.values());
  }

  public getConnector(id: string): CommercialIntegrationConnector | undefined {
    return this.connectors.get(id);
  }

  public updateConnectorStatus(
    id: string,
    status: CommercialIntegrationStatus,
    verifiedAt?: string
  ): CommercialIntegrationConnector {
    const existing = this.connectors.get(id);
    if (!existing) {
      throw new Error(`Integration connector ${id} not found.`);
    }

    const updated: CommercialIntegrationConnector = {
      ...existing,
      status,
      isAvailable: status === 'CONNECTED',
      verifiedAt: status === 'CONNECTED' ? (verifiedAt || new Date().toISOString()) : existing.verifiedAt
    };

    this.connectors.set(id, updated);
    return updated;
  }
}
