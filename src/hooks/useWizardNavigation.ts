// Custom hook for wizard navigation logic

import { useState, useCallback } from 'react';
import type { ConfigurationStep, StrategyFormData } from '../types/chatConfiguration';
import { steps, isStepComplete, canNavigateToStep } from '../utils/stepValidation';

export const useWizardNavigation = (formData: StrategyFormData) => {
  const [currentStep, setCurrentStep] = useState<ConfigurationStep>('overview');

  const navigateToStep = useCallback((step: ConfigurationStep) => {
    if (canNavigateToStep(step, formData)) {
      setCurrentStep(step);
      return true;
    }
    return false;
  }, [formData]);

  const goToNextStep = useCallback(() => {
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1].id as ConfigurationStep;
      return navigateToStep(nextStep);
    }
    return false;
  }, [currentStep, navigateToStep]);

  const goToPreviousStep = useCallback(() => {
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    if (currentIndex > 0) {
      const previousStep = steps[currentIndex - 1].id as ConfigurationStep;
      setCurrentStep(previousStep);
      return true;
    }
    return false;
  }, [currentStep]);

  const isCurrentStepComplete = useCallback(() => {
    return isStepComplete(currentStep, formData);
  }, [currentStep, formData]);

  const canGoToNext = useCallback(() => {
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    if (currentIndex >= steps.length - 1) return false;
    
    const nextStep = steps[currentIndex + 1].id as ConfigurationStep;
    return isStepComplete(currentStep, formData) && canNavigateToStep(nextStep, formData);
  }, [currentStep, formData]);

  const canGoToPrevious = useCallback(() => {
    return currentStep !== 'overview';
  }, [currentStep]);

  const resetToFirstStep = useCallback(() => {
    setCurrentStep('overview');
  }, []);

  return {
    currentStep,
    navigateToStep,
    goToNextStep,
    goToPreviousStep,
    isCurrentStepComplete,
    canGoToNext,
    canGoToPrevious,
    resetToFirstStep,
    isStepComplete: (step: ConfigurationStep) => isStepComplete(step, formData),
    canNavigateToStep: (step: ConfigurationStep) => canNavigateToStep(step, formData)
  };
};
