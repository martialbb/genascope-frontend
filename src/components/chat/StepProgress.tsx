// Step Progress Component for the wizard navigation

import React from 'react';
import type { ConfigurationStep } from '../../types/chatConfiguration';
import { steps } from '../../utils/stepValidation';

interface StepProgressProps {
  currentStep: ConfigurationStep;
  onStepClick: (step: ConfigurationStep) => void;
  isStepComplete: (step: ConfigurationStep) => boolean;
  canNavigateToStep: (step: ConfigurationStep) => boolean;
}

export const StepProgress: React.FC<StepProgressProps> = ({
  currentStep,
  onStepClick,
  isStepComplete,
  canNavigateToStep
}) => {
  return (
    <div className="mb-12">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center group">
            <div className="flex flex-col items-center">
              <button
                onClick={() => {
                  if (canNavigateToStep(step.id as ConfigurationStep)) {
                    onStepClick(step.id as ConfigurationStep);
                  }
                }}
                disabled={!canNavigateToStep(step.id as ConfigurationStep)}
                className={`flex items-center justify-center w-12 h-12 rounded-full text-sm font-bold shadow-lg transition-all duration-300 ${
                  step.id === currentStep
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white ring-4 ring-blue-100'
                    : steps.findIndex(s => s.id === currentStep) > index || isStepComplete(step.id as ConfigurationStep)
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
                    : canNavigateToStep(step.id as ConfigurationStep)
                    ? 'bg-gray-200 text-gray-600 hover:bg-gray-300 cursor-pointer'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                }`}
              >
                {steps.findIndex(s => s.id === currentStep) > index || isStepComplete(step.id as ConfigurationStep) ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  index + 1
                )}
              </button>
              <div className="mt-4 text-center">
                <div className={`text-sm font-bold ${
                  step.id === currentStep ? 'text-blue-600' : 
                  canNavigateToStep(step.id as ConfigurationStep) ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {step.name}
                </div>
                <div className="text-xs text-gray-500 mt-1">{step.description}</div>
                {isStepComplete(step.id as ConfigurationStep) && step.id !== currentStep && (
                  <div className="text-xs text-green-600 font-medium mt-1">✓ Complete</div>
                )}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 mx-6 h-1 rounded-full transition-all duration-300 ${
                steps.findIndex(s => s.id === currentStep) > index || isStepComplete(step.id as ConfigurationStep)
                  ? 'bg-gradient-to-r from-green-400 to-green-500'
                  : 'bg-gray-200'
              }`}></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
