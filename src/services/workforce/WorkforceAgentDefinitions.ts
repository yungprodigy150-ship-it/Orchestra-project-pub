/**
 * ORCHESTRA Stage 4: Specialized Agent Definitions & JSON Schemas
 * Authoritative system directives, JSON schema contracts, and context formatting
 * for the 4 core business intelligence agents.
 */

import {
  MarketIntelligenceOutput,
  OpportunityHunterOutput,
  ProspectIntelligenceOutput,
  PortfolioStrategyOutput
} from '../../types/workforce';

// 1. Market Intelligence JSON Schema
export const MARKET_INTELLIGENCE_SCHEMA = {
  type: 'object',
  properties: {
    marketOverview: {
      type: 'string',
      description: 'Comprehensive overview of the market sector, macroeconomic forces, and current dynamics'
    },
    targetAudience: {
      type: 'string',
      description: 'Specific buyer personas, platform engineering leads, and technical decision-makers'
    },
    customerPainPoints: {
      type: 'array',
      items: { type: 'string' },
      description: 'Key acute operational, architectural, and financial pain points experienced by customers'
    },
    competitorLandscape: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          competitorName: { type: 'string' },
          keyStrengths: { type: 'string' },
          keyWeaknesses: { type: 'string' },
          pricingModel: { type: 'string' },
          marketShareEstimate: { type: 'string' }
        },
        required: ['competitorName', 'keyStrengths', 'keyWeaknesses']
      },
      description: 'Teardown of primary incumbent and emerging competitor offerings'
    },
    marketOpportunities: {
      type: 'array',
      items: { type: 'string' },
      description: 'Underserved niches, architectural shifts, and white-space market opportunities'
    },
    risks: {
      type: 'array',
      items: { type: 'string' },
      description: 'Regulatory, technological obsolescence, and margin pressure risks'
    },
    evidenceAndSources: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          citation: { type: 'string' },
          verificationConfidence: { type: 'string', enum: ['high', 'medium', 'provisional'] }
        },
        required: ['title', 'citation', 'verificationConfidence']
      },
      description: 'Supporting technical whitepapers, SEC filings, GitHub telemetry, and benchmarks'
    },
    recommendedNextSteps: {
      type: 'array',
      items: { type: 'string' },
      description: 'Actionable steps for ORCHESTRA ventures to exploit these market dynamics'
    }
  },
  required: [
    'marketOverview',
    'targetAudience',
    'customerPainPoints',
    'competitorLandscape',
    'marketOpportunities',
    'risks',
    'evidenceAndSources',
    'recommendedNextSteps'
  ]
};

// 2. Opportunity Hunter JSON Schema
export const OPPORTUNITY_HUNTER_SCHEMA = {
  type: 'object',
  properties: {
    opportunityTitle: {
      type: 'string',
      description: 'High-conviction concise commercial opportunity title'
    },
    description: {
      type: 'string',
      description: 'Detailed analysis of the market opening or customer expansion path'
    },
    opportunityCategory: {
      type: 'string',
      enum: ['enterprise_client', 'strategic_partner', 'software_distribution', 'market_gap'],
      description: 'Commercial taxonomy of the opportunity'
    },
    targetMarket: {
      type: 'string',
      description: 'Industry segment and enterprise profile (e.g., Mid-Market FinTech, High-Volume Data Platforms)'
    },
    relevantProduct: {
      type: 'string',
      description: 'Matching ORCHESTRA portfolio venture (AetherCloud, RelaySync, OmniGraph)'
    },
    potentialValue: {
      type: 'string',
      description: 'Estimated ARR or contract valuation (e.g. "$140,000 ARR", "$450,000 multi-year")'
    },
    confidenceLevel: {
      type: 'string',
      enum: ['high', 'medium', 'provisional'],
      description: 'Confidence based on verified market signals vs hypotheses'
    },
    supportingEvidence: {
      type: 'array',
      items: { type: 'string' },
      description: 'Verifiable data points, cloud spend metrics, or hiring signals supporting this opportunity'
    },
    recommendedAction: {
      type: 'string',
      description: 'Immediate next commercial or tactical action step'
    }
  },
  required: [
    'opportunityTitle',
    'description',
    'opportunityCategory',
    'targetMarket',
    'relevantProduct',
    'potentialValue',
    'confidenceLevel',
    'supportingEvidence',
    'recommendedAction'
  ]
};

// 3. Prospect Intelligence JSON Schema
export const PROSPECT_INTELLIGENCE_SCHEMA = {
  type: 'object',
  properties: {
    organizationName: {
      type: 'string',
      description: 'Exact corporate or organization name'
    },
    industry: {
      type: 'string',
      description: 'Primary industry classification (e.g., Algorithmic Trading, HealthTech Infrastructure)'
    },
    websiteOrPublicSource: {
      type: 'string',
      description: 'Verified public domain, SEC CIK, or GitHub organization handle'
    },
    businessOverview: {
      type: 'string',
      description: 'Business model, estimated scale, and infrastructure footprint'
    },
    identifiedNeeds: {
      type: 'array',
      items: { type: 'string' },
      description: 'Specific operational, database, or cloud cost challenges identified'
    },
    potentialProductMatch: {
      type: 'string',
      description: 'Which ORCHESTRA portfolio venture directly addresses their operational pain'
    },
    qualificationScore: {
      type: 'number',
      description: 'Readiness and suitability score from 1 to 100'
    },
    evidence: {
      type: 'array',
      items: { type: 'string' },
      description: 'Tech stack detections, job posting requirements, and infrastructure spend evidence'
    },
    recommendedApproach: {
      type: 'string',
      description: 'Tailored executive outreach angle, technical value brief, or pilot architecture proposal'
    }
  },
  required: [
    'organizationName',
    'industry',
    'websiteOrPublicSource',
    'businessOverview',
    'identifiedNeeds',
    'potentialProductMatch',
    'qualificationScore',
    'evidence',
    'recommendedApproach'
  ]
};

// 4. Portfolio Strategist JSON Schema
export const PORTFOLIO_STRATEGY_SCHEMA = {
  type: 'object',
  properties: {
    product: {
      type: 'string',
      description: 'Name of the analyzed portfolio venture (AetherCloud, RelaySync, OmniGraph)'
    },
    targetAudience: {
      type: 'string',
      description: 'Refined enterprise buyer persona and technical champion definition'
    },
    coreValueProposition: {
      type: 'string',
      description: 'Quantifiable ROI and technical differentiation statement'
    },
    relevantCustomerProblems: {
      type: 'array',
      items: { type: 'string' },
      description: 'Critical business problems resolved by this product'
    },
    marketPositioning: {
      type: 'string',
      description: 'Strategic market positioning relative to open-source tools and legacy vendors'
    },
    potentialCustomers: {
      type: 'array',
      items: { type: 'string' },
      description: 'Archetypal prospect companies or customer profiles best suited for this product'
    },
    recommendedImprovements: {
      type: 'array',
      items: { type: 'string' },
      description: 'High-leverage product enhancements, integrations, or roadmap pivots'
    }
  },
  required: [
    'product',
    'targetAudience',
    'coreValueProposition',
    'relevantCustomerProblems',
    'marketPositioning',
    'potentialCustomers',
    'recommendedImprovements'
  ]
};

// 5. Coordinated Pipeline Final Synthesis Schema
export const WORKFLOW_SYNTHESIS_SCHEMA = {
  type: 'object',
  properties: {
    executiveSummary: {
      type: 'string',
      description: 'Executive briefing synthesizing the findings of the 4 specialized agents'
    },
    keyFindings: {
      type: 'array',
      items: { type: 'string' },
      description: 'Core synthesized discoveries spanning market trends, opportunities, and prospect qualification'
    },
    recommendedInitiatives: {
      type: 'array',
      items: { type: 'string' },
      description: 'Concrete prioritized initiatives for the ORCHESTRA workforce'
    },
    commercialImpactEstimate: {
      type: 'string',
      description: 'Total revenue or pipeline value unlocked by executing these recommendations'
    },
    riskAssessment: {
      type: 'string',
      description: 'Execution hazards, competitive counters, and mitigation guardrails'
    },
    requiresHumanSignoff: {
      type: 'boolean',
      description: 'Whether human supervisor signoff is required before external transmission or execution'
    }
  },
  required: [
    'executiveSummary',
    'keyFindings',
    'recommendedInitiatives',
    'commercialImpactEstimate',
    'riskAssessment',
    'requiresHumanSignoff'
  ]
};
