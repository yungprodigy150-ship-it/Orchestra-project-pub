/**
 * ORCHESTRA Stage 5: Commercial Agent Definitions & JSON Schemas
 * Strict schema specifications for Marketing Strategist, Campaign Planner,
 * Outreach Assistant, Relationship Manager, and Growth Analyst.
 */

export const MARKETING_STRATEGY_SCHEMA = {
  type: 'object',
  properties: {
    productBeingMarketed: { type: 'string', description: 'Name of the ORCHESTRA portfolio product being positioned' },
    targetAudience: { type: 'string', description: 'Specific buyer personas, enterprise roles, and segment definition' },
    customerPainPoints: {
      type: 'array',
      items: { type: 'string' },
      description: 'Validated customer problems and operational friction points'
    },
    valueProposition: { type: 'string', description: 'Quantifiable core value proposition and primary differentiator' },
    competitivePositioning: { type: 'string', description: 'Market positioning relative to existing incumbents' },
    recommendedChannels: {
      type: 'array',
      items: { type: 'string' },
      description: 'High-conversion organic and targeted acquisition channels'
    },
    marketingStrategy: { type: 'string', description: 'Comprehensive strategic narrative and market entry posture' },
    budgetConsiderations: { type: 'string', description: 'Pragmatic resource requirements and cost efficiencies' },
    successMetrics: {
      type: 'array',
      items: { type: 'string' },
      description: 'Measurable leading and lagging indicators'
    },
    recommendedNextActions: {
      type: 'array',
      items: { type: 'string' },
      description: 'Concrete next actions for the Campaign Planner and commercial team'
    }
  },
  required: [
    'productBeingMarketed',
    'targetAudience',
    'customerPainPoints',
    'valueProposition',
    'competitivePositioning',
    'recommendedChannels',
    'marketingStrategy',
    'budgetConsiderations',
    'successMetrics',
    'recommendedNextActions'
  ]
};

export const CAMPAIGN_PLAN_SCHEMA = {
  type: 'object',
  properties: {
    campaignName: { type: 'string', description: 'Descriptive, professional campaign title' },
    objective: { type: 'string', description: 'Clear strategic objective of the campaign' },
    targetAudience: { type: 'string', description: 'Specific target segment and technical buying committee' },
    campaignConcept: { type: 'string', description: 'Core thematic hook, narrative, or value angle' },
    contentRequirements: {
      type: 'array',
      items: { type: 'string' },
      description: 'Required editorial pieces, benchmarks, technical briefs, or collateral'
    },
    distributionChannels: {
      type: 'array',
      items: { type: 'string' },
      description: 'Targeted distribution channels for the campaign'
    },
    timeline: { type: 'string', description: 'Execution timeline and duration phases' },
    requiredResources: {
      type: 'array',
      items: { type: 'string' },
      description: 'Specialist agents and technical collateral required'
    },
    performanceIndicators: {
      type: 'array',
      items: { type: 'string' },
      description: 'Key quantifiable metrics to evaluate upon completion'
    },
    executionChecklist: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          step: { type: 'string' },
          assignedRole: { type: 'string' },
          isCompleted: { type: 'boolean' }
        },
        required: ['step', 'assignedRole', 'isCompleted']
      },
      description: 'Sequential operational tasks for campaign execution'
    }
  },
  required: [
    'campaignName',
    'objective',
    'targetAudience',
    'campaignConcept',
    'contentRequirements',
    'distributionChannels',
    'timeline',
    'requiredResources',
    'performanceIndicators',
    'executionChecklist'
  ]
};

export const OUTREACH_PLAN_SCHEMA = {
  type: 'object',
  properties: {
    prospect: { type: 'string', description: 'Target organization or enterprise prospect' },
    contactContext: { type: 'string', description: 'Publicly sourced context or observed technical profile' },
    communicationObjective: { type: 'string', description: 'Goal of this communication touchpoint' },
    recommendedApproach: { type: 'string', description: 'High-touch strategic outreach angle' },
    personalizedMessage: { type: 'string', description: 'Draft business communication ready for human operator review' },
    relevantProduct: { type: 'string', description: 'Portfolio product solving their specific challenge' },
    followUpRecommendation: { type: 'string', description: 'Recommended follow-up Cadence and fallback angle' },
    confidenceAssessment: {
      type: 'string',
      enum: ['high', 'medium', 'provisional'],
      description: 'Confidence in value-proposition alignment'
    }
  },
  required: [
    'prospect',
    'contactContext',
    'communicationObjective',
    'recommendedApproach',
    'personalizedMessage',
    'relevantProduct',
    'followUpRecommendation',
    'confidenceAssessment'
  ]
};

export const RELATIONSHIP_INTERACTION_SCHEMA = {
  type: 'object',
  properties: {
    organization: { type: 'string', description: 'Organization name' },
    contactName: { type: 'string', description: 'Publicly available contact name if verified' },
    industry: { type: 'string', description: 'Industry vertical' },
    pipelineStage: {
      type: 'string',
      enum: [
        'DISCOVERED',
        'RESEARCHING',
        'QUALIFIED',
        'CONTACT_PREPARED',
        'AWAITING_APPROVAL',
        'CONTACTED',
        'RESPONDED',
        'NEGOTIATION',
        'CONVERTED',
        'UNQUALIFIED'
      ],
      description: 'Current verified CRM stage'
    },
    relationshipCategory: {
      type: 'string',
      enum: ['prospect', 'customer', 'strategic_partner', 'distribution_channel']
    },
    notes: { type: 'string', description: 'Diagnostic notes and historical context' },
    nextRecommendedAction: { type: 'string', description: 'Next scheduled touchpoint or task' },
    qualificationScore: { type: 'number', description: 'Score between 1 and 100' }
  },
  required: [
    'organization',
    'industry',
    'pipelineStage',
    'relationshipCategory',
    'notes',
    'nextRecommendedAction'
  ]
};

export const GROWTH_ANALYSIS_SCHEMA = {
  type: 'object',
  properties: {
    analysisPeriod: { type: 'string', description: 'Observed timeframe of business operations' },
    availableData: { type: 'string', description: 'Factual summary of actual recorded events and metrics' },
    performanceObservations: {
      type: 'array',
      items: { type: 'string' },
      description: 'Empirical observations strictly based on real data'
    },
    identifiedBottlenecks: {
      type: 'array',
      items: { type: 'string' },
      description: 'Conversion bottlenecks and operational hurdles'
    },
    growthOpportunities: {
      type: 'array',
      items: { type: 'string' },
      description: 'High-leverage growth vectors'
    },
    risks: {
      type: 'array',
      items: { type: 'string' },
      description: 'Churn, competitive displacement, or commercial friction risks'
    },
    recommendations: {
      type: 'array',
      items: { type: 'string' },
      description: 'Actionable recommendations for portfolio products and marketing'
    },
    suggestedExperiments: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          hypothesis: { type: 'string' },
          experiment: { type: 'string' },
          metric: { type: 'string' },
          estimatedTimeframe: { type: 'string' }
        },
        required: ['hypothesis', 'experiment', 'metric', 'estimatedTimeframe']
      },
      description: 'Concrete growth experiments with testable hypotheses'
    },
    dataReliability: {
      type: 'string',
      enum: ['measured', 'provisional_estimate', 'ai_hypothesis'],
      description: 'Clear classification of data integrity'
    }
  },
  required: [
    'analysisPeriod',
    'availableData',
    'performanceObservations',
    'identifiedBottlenecks',
    'growthOpportunities',
    'risks',
    'recommendations',
    'suggestedExperiments',
    'dataReliability'
  ]
};
