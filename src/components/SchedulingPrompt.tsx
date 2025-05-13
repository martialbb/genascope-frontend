// src/components/SchedulingPrompt.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface SchedulingPromptProps {
  patientId: string;
  eligibilityResult?: {
    is_eligible: boolean;
    nccn_eligible: boolean;
    tyrer_cuzick_score: number;
    tyrer_cuzick_threshold: number;
  };
  testResultsAvailable?: boolean;
}

const SchedulingPrompt: React.FC<SchedulingPromptProps> = ({ 
  patientId,
  eligibilityResult,
  testResultsAvailable = false
}) => {
  // We'd use actual navigation in a real app, but for demonstration:
  const navigateToScheduling = () => {
    window.location.href = `/schedule-appointment?type=patient&patientId=${patientId}`;
  };
  
  // Determine the appropriate prompt based on eligibility or test results
  const getPromptContent = () => {
    if (testResultsAvailable) {
      return {
        title: "Your Test Results Are Ready",
        description: "Schedule a consultation with a genetic counselor to discuss your results and next steps.",
        buttonText: "Schedule Results Consultation",
        urgency: "medium"
      };
    } else if (eligibilityResult) {
      if (eligibilityResult.is_eligible) {
        // High risk - recommend urgent appointment
        return {
          title: "Genetic Testing Recommended",
          description: "Based on your risk assessment, we recommend scheduling an appointment with a genetic counselor to discuss testing options.",
          buttonText: "Schedule Priority Consultation",
          urgency: "high"
        };
      } else {
        // Lower risk - still offer appointment
        return {
          title: "Risk Assessment Complete",
          description: "Your risk assessment is complete. You may benefit from discussing your results with a genetic counselor.",
          buttonText: "Schedule Optional Consultation",
          urgency: "low"
        };
      }
    } else {
      // Default prompt
      return {
        title: "Schedule a Follow-Up",
        description: "Connect with a genetic counselor to discuss your risk factors and options.",
        buttonText: "Schedule Consultation",
        urgency: "medium"
      };
    }
  };
  
  const promptContent = getPromptContent();
  
  // Determine the UI styling based on urgency
  const getUrgencyStyles = () => {
    switch(promptContent.urgency) {
      case "high":
        return {
          container: "border-red-300 bg-red-50",
          icon: "text-red-500",
          button: "bg-red-600 hover:bg-red-700 focus:ring-red-500"
        };
      case "medium":
        return {
          container: "border-blue-300 bg-blue-50",
          icon: "text-blue-500",
          button: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
        };
      case "low":
      default:
        return {
          container: "border-green-300 bg-green-50",
          icon: "text-green-500",
          button: "bg-green-600 hover:bg-green-700 focus:ring-green-500"
        };
    }
  };
  
  const styles = getUrgencyStyles();
  
  return (
    <div className={`rounded-md border ${styles.container} p-6 mb-6`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <svg 
            className={`h-8 w-8 ${styles.icon}`} 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-lg font-medium">{promptContent.title}</h3>
          <div className="mt-2">
            <p className="text-sm">
              {promptContent.description}
            </p>
          </div>
          <div className="mt-4">
            <button
              type="button"
              onClick={navigateToScheduling}
              className={`inline-flex items-center rounded-md border border-transparent ${styles.button} px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2`}
            >
              {promptContent.buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulingPrompt;
