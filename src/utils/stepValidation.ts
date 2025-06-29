// Configuration steps and validation logic

import type { ConfigurationStep, StepDefinition, StrategyFormData } from '../types/chatConfiguration';

export const steps: StepDefinition[] = [
  { id: 'overview', name: 'Overview', description: 'Basic strategy information' },
  { id: 'targeting', name: 'Targeting', description: 'Define who this strategy targets' },
  { id: 'knowledge', name: 'Knowledge', description: 'Upload training materials' },
  { id: 'outcomes', name: 'Outcomes', description: 'Configure follow-up actions' },
  { id: 'testing', name: 'Testing', description: 'Test your strategy' },
  { id: 'review', name: 'Review', description: 'Review and deploy' }
];

export const isStepComplete = (step: ConfigurationStep, formData: StrategyFormData): boolean => {
  switch (step) {
    case 'overview':
      return !!(formData.name && formData.description && formData.goal && formData.patient_introduction);
    case 'targeting':
      return formData.targeting_rules.length > 0;
    case 'knowledge':
      return formData.knowledge_source_ids.length > 0 || !!formData.knowledge_completed;
    case 'outcomes':
      return formData.outcome_actions.length > 0 || !!formData.outcomes_completed;
    case 'testing':
      return !!formData.testing_completed;
    case 'review':
      return !!formData.review_completed;
    default:
      return false;
  }
};

export const canNavigateToStep = (targetStep: ConfigurationStep, currentFormData: StrategyFormData): boolean => {
  const stepIndex = steps.findIndex(s => s.id === targetStep);
  
  // Can always navigate to first step
  if (stepIndex === 0) return true;
  
  // Check if all previous steps are complete
  for (let i = 0; i < stepIndex; i++) {
    if (!isStepComplete(steps[i].id as ConfigurationStep, currentFormData)) {
      return false;
    }
  }
  
  return true;
};
