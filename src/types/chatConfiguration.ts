// Shared TypeScript types for Chat Configuration components

import type { TargetingRule, OutcomeAction } from '../services/chatConfigurationApi';

export type ConfigurationStep = 'overview' | 'targeting' | 'knowledge' | 'outcomes' | 'testing' | 'review';

export interface StrategyFormData {
  name: string;
  description: string;
  goal: string;
  patient_introduction: string;
  specialty: string;
  is_active: boolean;
  targeting_rules: TargetingRule[];
  knowledge_source_ids: string[];
  outcome_actions: OutcomeAction[];
  // Step completion tracking
  knowledge_completed?: boolean;
  outcomes_completed?: boolean;
  testing_completed?: boolean;
  review_completed?: boolean;
}

export interface TargetingRuleForm {
  name: string;
  field: string;
  operator: string;
  value: string | string[] | Record<string, any>;
  sequence: number;
}

export interface StepDefinition {
  id: string;
  name: string;
  description: string;
}

export interface TestScenario {
  id: number;
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
}

// Re-export from API types
export type { 
  ChatStrategy, 
  KnowledgeSource, 
  ChatStrategyCreate,
  TargetingRule,
  OutcomeAction
} from '../services/chatConfigurationApi';
