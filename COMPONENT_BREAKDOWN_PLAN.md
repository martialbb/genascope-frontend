// Component Breakdown Plan for ChatConfigurationPage.tsx
// Current: 2189 lines → Target: ~15 focused components

/**
 * MAIN CONTAINER COMPONENTS (3)
 */
// 1. ChatConfigurationManager.tsx (~100 lines)
//    - Main component with view state management
//    - Navigation between dashboard/wizard/analytics
//    - Error boundary and loading states

// 2. ChatDashboard.tsx (~200 lines)  
//    - Strategy list view
//    - Filtering, pagination, search
//    - Strategy cards grid

// 3. ChatWizard.tsx (~150 lines)
//    - Step navigation and progress
//    - Step validation logic
//    - Form state management

/**
 * WIZARD STEP COMPONENTS (6)
 */
// 4. OverviewStep.tsx (~150 lines)
//    - Basic strategy information form
//    - Name, description, goal, specialty

// 5. TargetingStep.tsx (~200 lines)
//    - Targeting rules management
//    - Rule form and validation

// 6. KnowledgeStep.tsx (~300 lines)
//    - File upload functionality
//    - Knowledge source selection
//    - Drag & drop interface

// 7. OutcomesStep.tsx (~250 lines)
//    - Outcome actions configuration
//    - Action type definitions

// 8. TestingStep.tsx (~200 lines)
//    - Strategy testing interface
//    - Test scenarios and results

// 9. ReviewStep.tsx (~150 lines)
//    - Final review and deployment
//    - Summary of all configurations

/**
 * REUSABLE UI COMPONENTS (6)
 */
// 10. StrategyCard.tsx (~80 lines)
//     - Individual strategy display card
//     - Actions and status indicators

// 11. StepProgress.tsx (~100 lines)
//     - Wizard step progress indicator
//     - Navigation between steps

// 12. FileUpload.tsx (~150 lines)
//     - Drag & drop file upload
//     - Progress indicators

// 13. FilterControls.tsx (~100 lines)
//     - Search, status, and specialty filters
//     - Pagination controls

// 14. TargetingRuleForm.tsx (~120 lines)
//     - Individual targeting rule editor
//     - Field validation and operators

// 15. ActionConfiguration.tsx (~100 lines)
//     - Outcome action configuration
//     - Dynamic form based on action type

/**
 * SHARED UTILITIES
 */
// hooks/useChatStrategy.ts - API operations
// hooks/useWizardNavigation.ts - Step navigation logic
// types/chatConfiguration.ts - All TypeScript interfaces
// utils/validation.ts - Form validation logic
// constants/buttonStyles.ts - Shared button styles
