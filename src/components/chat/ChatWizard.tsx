// Chat Wizard Component - manages the step-by-step strategy creation/editing

import React from 'react';
import { StepProgress } from './StepProgress';
import { OverviewStep } from './steps/OverviewStep';
import { TargetingStep } from './steps/TargetingStep';
import { KnowledgeStep } from './steps/KnowledgeStep';
import { OutcomesStep } from './steps/OutcomesStep';
import { TestingStep } from './steps/TestingStep';
import { ReviewStep } from './steps/ReviewStep';
import { useWizardNavigation } from '../../hooks/useWizardNavigation';
import type { StrategyFormData, KnowledgeSource } from '../../types/chatConfiguration';
import { buttonStyles } from '../../constants/buttonStyles';

interface ChatWizardProps {
  formData: StrategyFormData;
  onFormChange: (field: keyof StrategyFormData, value: any) => void;
  onSave: () => Promise<void> | void;
  onCancel: () => void;
  knowledgeSources: KnowledgeSource[];
  isEditing: boolean;
  loading: boolean;
  onFileUpload?: (files: FileList) => Promise<void>;
}

export const ChatWizard: React.FC<ChatWizardProps> = ({
  formData,
  onFormChange,
  onSave,
  onCancel,
  knowledgeSources,
  isEditing,
  loading,
  onFileUpload
}) => {
  const {
    currentStep,
    navigateToStep,
    goToNextStep,
    goToPreviousStep,
    isCurrentStepComplete,
    canGoToNext,
    canGoToPrevious,
    isStepComplete,
    canNavigateToStep
  } = useWizardNavigation(formData);

  const renderWizardStep = () => {
    switch (currentStep) {
      case 'overview':
        return (
          <OverviewStep
            formData={formData}
            onFormChange={onFormChange}
          />
        );
      
      case 'targeting':
        return (
          <TargetingStep
            formData={formData}
            onFormChange={onFormChange}
          />
        );
      
      case 'knowledge':
        return (
          <KnowledgeStep
            formData={formData}
            onFormChange={onFormChange}
            knowledgeSources={knowledgeSources}
            onFileUpload={onFileUpload}
          />
        );
      
      case 'outcomes':
        return (
          <OutcomesStep
            formData={formData}
            onFormChange={onFormChange}
          />
        );
      
      case 'testing':
        return (
          <TestingStep
            formData={formData}
            onFormChange={onFormChange}
          />
        );
      
      case 'review':
        return (
          <ReviewStep
            formData={formData}
            onFormChange={onFormChange}
            knowledgeSources={knowledgeSources}
            onSave={onSave}
            isEditing={isEditing}
            loading={loading}
          />
        );
      
      default:
        return <div>Unknown step</div>;
    }
  };

  const handleNext = async () => {
    if (currentStep === 'review') {
      await onSave();
    } else {
      goToNextStep();
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Strategy' : 'Create New Strategy'}
          </h2>
          <p className="text-gray-600 mt-1">
            Follow the guided process to {isEditing ? 'update' : 'create'} your chat strategy
          </p>
        </div>
        <button
          onClick={onCancel}
          className={buttonStyles.secondary}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span>Cancel</span>
        </button>
      </div>

      {/* Step Progress */}
      <StepProgress
        currentStep={currentStep}
        onStepClick={navigateToStep}
        isStepComplete={isStepComplete}
        canNavigateToStep={canNavigateToStep}
      />

      {/* Step Content */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-8">
          {renderWizardStep()}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="mt-8 flex justify-between">
        <button
          onClick={goToPreviousStep}
          disabled={!canGoToPrevious()}
          className={`${buttonStyles.secondary} ${!canGoToPrevious() ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Previous</span>
        </button>
        
        <button
          onClick={handleNext}
          disabled={
            loading || 
            (currentStep === 'review' ? false : !isCurrentStepComplete() || !canGoToNext())
          }
          className={`${buttonStyles.primary} ${
            loading || (currentStep !== 'review' && (!isCurrentStepComplete() || !canGoToNext())) 
              ? 'opacity-50 cursor-not-allowed' 
              : ''
          }`}
        >
          <span>
            {currentStep === 'review' 
              ? (loading ? 'Deploying...' : `${isEditing ? 'Update' : 'Deploy'} Strategy`) 
              : (isCurrentStepComplete() ? 'Next' : 'Complete This Step')
            }
          </span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};
