import React, { useState, useEffect } from 'react';
import { chatConfigurationAPI } from '../services/chatConfigurationApi';
import type { 
  ChatStrategy, 
  KnowledgeSource, 
  ChatStrategyCreate, 
  ChatStrategyUpdate,
  KnowledgeSourceCreate,
  FileUploadRequest,
  TargetingRule,
  TargetingRuleCreate,
  OutcomeAction,
  OutcomeActionCreate
} from '../services/chatConfigurationApi';

// Step definitions for the guided workflow
type ConfigurationStep = 'overview' | 'targeting' | 'knowledge' | 'outcomes' | 'testing' | 'review';

interface TargetingRuleForm {
  name: string;
  field: string;
  operator: string;
  value: string | string[] | Record<string, any>;
  sequence: number;
}

interface OutcomeActionForm {
  name: string;
  condition: string;
  action_type: string;
  details: Record<string, any>;
  sequence: number;
}

interface StrategyFormData {
  name: string;
  description: string;
  goal: string;
  patient_introduction: string;
  specialty: string;
  is_active: boolean;
  knowledge_source_ids: string[];
  targeting_rules: TargetingRuleForm[];
  outcome_actions: OutcomeActionForm[];
  clinical_guidelines: string[];
  risk_models: string[];
}

const ChatConfigurationManagerNew: React.FC = () => {
  const [strategies, setStrategies] = useState<ChatStrategy[]>([]);
  const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSource[]>([]);
  const [activeView, setActiveView] = useState<'dashboard' | 'wizard' | 'analytics'>('dashboard');
  const [selectedStrategy, setSelectedStrategy] = useState<ChatStrategy | null>(null);
  const [currentStep, setCurrentStep] = useState<ConfigurationStep>('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<any>(null);
  
  // Enhanced configuration form state
  const [strategyForm, setStrategyForm] = useState<StrategyFormData>({
    name: '',
    description: '',
    goal: '',
    patient_introduction: '',
    specialty: 'Oncology',
    is_active: false,
    knowledge_source_ids: [],
    targeting_rules: [],
    outcome_actions: [],
    clinical_guidelines: [],
    risk_models: []
  });

  // Step validation state
  const [stepValidation, setStepValidation] = useState<Record<ConfigurationStep, boolean>>({
    overview: false,
    targeting: true, // Optional
    knowledge: true, // Optional  
    outcomes: true, // Optional
    testing: true, // Optional
    review: false
  });

  // File upload state
  const [uploadingFile, setUploadingFile] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadStrategies();
    loadKnowledgeSources();
  }, []);

  // Validate steps when form changes
  useEffect(() => {
    validateSteps();
  }, [strategyForm]);

  // Populate form when editing a strategy
  useEffect(() => {
    if (selectedStrategy && activeView === 'wizard') {
      setStrategyForm({
        name: selectedStrategy.name || '',
        description: selectedStrategy.description || '',
        goal: selectedStrategy.goal || '',
        patient_introduction: selectedStrategy.patient_introduction || '',
        specialty: selectedStrategy.specialty || 'Oncology',
        is_active: selectedStrategy.is_active || false,
        knowledge_source_ids: selectedStrategy.knowledge_sources?.map((ks: any) => ks.id) || [],
        targeting_rules: selectedStrategy.targeting_rules?.map((rule: any) => ({
          name: rule.field || '',
          field: rule.field || '',
          operator: rule.operator || '',
          value: rule.value || '',
          sequence: rule.sequence || 0
        })) || [],
        outcome_actions: selectedStrategy.outcome_actions?.map((action: any) => ({
          name: action.action_type || '',
          condition: action.condition || '',
          action_type: action.action_type || '',
          details: action.details || {},
          sequence: action.sequence || 0
        })) || [],
        clinical_guidelines: [], // Could be extracted from knowledge sources if needed
        risk_models: [] // Could be extracted from knowledge sources if needed
      });
      setCurrentStep('overview'); // Start from the first step when editing
    }
  }, [selectedStrategy, activeView]);

  const loadStrategies = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiStrategies = await chatConfigurationAPI.getStrategies();
      setStrategies(apiStrategies);
    } catch (error) {
      console.error('Failed to load strategies:', error);
      setError('Failed to load strategies. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadKnowledgeSources = async () => {
    try {
      const apiSources = await chatConfigurationAPI.getKnowledgeSources();
      setKnowledgeSources(apiSources);
    } catch (error) {
      console.error('Failed to load knowledge sources:', error);
      setError('Failed to load knowledge sources. Please try again.');
    }
  };

  const validateSteps = () => {
    const newValidation = { ...stepValidation };
    
    // Overview validation - require name, description, goal, and patient_introduction
    newValidation.overview = !!(
      strategyForm.name && 
      strategyForm.description && 
      strategyForm.goal && 
      strategyForm.patient_introduction && 
      strategyForm.specialty
    );
    
    // Other steps are optional but always valid if overview is complete
    newValidation.targeting = true; // Optional - targeting rules
    newValidation.knowledge = true; // Optional - knowledge sources
    newValidation.outcomes = true; // Optional - outcome actions
    newValidation.testing = true; // Optional - testing
    
    // Review validation - requires overview to be valid
    newValidation.review = newValidation.overview;
    
    setStepValidation(newValidation);
  };

  const resetForm = () => {
    setStrategyForm({
      name: '',
      description: '',
      goal: '',
      patient_introduction: '',
      specialty: 'Oncology',
      is_active: false,
      knowledge_source_ids: [],
      targeting_rules: [],
      outcome_actions: [],
      clinical_guidelines: [],
      risk_models: []
    });
    setCurrentStep('overview');
    setSelectedStrategy(null);
    setTestResults(null);
  };

  const handleCreateStrategy = async () => {
    try {
      setLoading(true);
      const strategyData: ChatStrategyCreate = {
        name: strategyForm.name,
        description: strategyForm.description || '',
        goal: strategyForm.goal,
        patient_introduction: strategyForm.patient_introduction || '',
        specialty: strategyForm.specialty,
        knowledge_source_ids: strategyForm.knowledge_source_ids,
        targeting_rules: strategyForm.targeting_rules.map(rule => ({
          field: rule.field,
          operator: rule.operator,
          value: rule.value,
          sequence: rule.sequence
        })),
        outcome_actions: strategyForm.outcome_actions.map(action => ({
          condition: action.condition,
          action_type: action.action_type,
          details: action.details,
          sequence: action.sequence
        }))
      };
      
      const newStrategy = await chatConfigurationAPI.createStrategy(strategyData);
      setStrategies(prev => [...prev, newStrategy]);
      resetForm();
      setActiveView('dashboard');
    } catch (error) {
      console.error('Failed to create strategy:', error);
      setError('Failed to create strategy. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStrategy = async (id: string, updates: ChatStrategyUpdate) => {
    try {
      const updatedStrategy = await chatConfigurationAPI.updateStrategy(id, updates);
      setStrategies(prev => prev.map(s => s.id === id ? updatedStrategy : s));
    } catch (error) {
      console.error('Failed to update strategy:', error);
      setError('Failed to update strategy. Please try again.');
    }
  };

  const handleDeleteStrategy = async (id: string) => {
    if (!confirm('Are you sure you want to delete this strategy?')) return;
    
    try {
      await chatConfigurationAPI.deleteStrategy(id);
      setStrategies(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('Failed to delete strategy:', error);
      setError('Failed to delete strategy. Please try again.');
    }
  };

  const handleEditStrategy = async (strategyId: string) => {
    try {
      setLoading(true);
      // Fetch the complete strategy with all relationships
      const completeStrategy = await chatConfigurationAPI.getStrategy(strategyId);
      setSelectedStrategy(completeStrategy);
      setActiveView('wizard');
    } catch (error) {
      console.error('Failed to load strategy for editing:', error);
      setError('Failed to load strategy details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingFile(true);
      const uploadRequest: FileUploadRequest = {
        file,
        name: file.name.replace(/\.[^/.]+$/, ""),
        description: `Uploaded document - ${file.name}`,
        access_level: 'private'
      };
      
      await chatConfigurationAPI.uploadFile(uploadRequest);
      await loadKnowledgeSources(); // Refresh the list
      setShowFileUpload(false);
    } catch (error) {
      console.error('File upload failed:', error);
      setError('File upload failed. Please try again.');
    } finally {
      setUploadingFile(false);
    }
  };

  const addTargetingRule = () => {
    const newRule: TargetingRuleForm = {
      name: '',
      field: 'appointment_type',
      operator: 'is',
      value: '',
      sequence: strategyForm.targeting_rules.length
    };
    setStrategyForm(prev => ({
      ...prev,
      targeting_rules: [...prev.targeting_rules, newRule]
    }));
  };

  const updateTargetingRule = (index: number, field: keyof TargetingRuleForm, value: any) => {
    setStrategyForm(prev => ({
      ...prev,
      targeting_rules: prev.targeting_rules.map((rule, i) => 
        i === index ? { ...rule, [field]: value } : rule
      )
    }));
  };

  const removeTargetingRule = (index: number) => {
    setStrategyForm(prev => ({
      ...prev,
      targeting_rules: prev.targeting_rules.filter((_, i) => i !== index)
    }));
  };

  const addOutcomeAction = () => {
    const newAction: OutcomeActionForm = {
      name: '',
      condition: 'meets_criteria',
      action_type: 'create_task',
      details: {},
      sequence: strategyForm.outcome_actions.length
    };
    setStrategyForm(prev => ({
      ...prev,
      outcome_actions: [...prev.outcome_actions, newAction]
    }));
  };

  const updateOutcomeAction = (index: number, field: keyof OutcomeActionForm, value: any) => {
    setStrategyForm(prev => ({
      ...prev,
      outcome_actions: prev.outcome_actions.map((action, i) => 
        i === index ? { ...action, [field]: value } : action
      )
    }));
  };

  const removeOutcomeAction = (index: number) => {
    setStrategyForm(prev => ({
      ...prev,
      outcome_actions: prev.outcome_actions.filter((_, i) => i !== index)
    }));
  };

  const handleTestStrategy = async () => {
    try {
      setLoading(true);
      // Simulate testing - in real implementation this would call a sandbox API
      await new Promise(resolve => setTimeout(resolve, 2000));
      setTestResults({
        success: true,
        message: 'Strategy test completed successfully',
        scenarios: [
          { name: 'Oncology Patient - High Risk', result: 'meets_criteria', actions: ['create_task'] },
          { name: 'Routine Checkup', result: 'does_not_meet_criteria', actions: [] },
          { name: 'Incomplete Data', result: 'incomplete_data', actions: ['send_message'] }
        ]
      });
    } catch (error) {
      setTestResults({
        success: false,
        message: 'Strategy test failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatFileSize = (sizeInBytes?: number) => {
    if (!sizeInBytes) return 'N/A';
    return `${(sizeInBytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const getStepStatus = (step: ConfigurationStep) => {
    if (currentStep === step) return 'current';
    const stepOrder: ConfigurationStep[] = ['overview', 'targeting', 'knowledge', 'outcomes', 'testing', 'review'];
    const currentIndex = stepOrder.indexOf(currentStep);
    const stepIndex = stepOrder.indexOf(step);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepValidation[step]) return 'valid';
    return 'pending';
  };

  const canProceedToStep = (step: ConfigurationStep) => {
    const dependencies: Record<ConfigurationStep, ConfigurationStep[]> = {
      overview: [],
      targeting: ['overview'],
      knowledge: ['overview'],
      outcomes: ['overview'],
      testing: ['overview'],
      review: ['overview']
    };
    
    return dependencies[step].every(dep => stepValidation[dep]);
  };

  const nextStep = () => {
    const stepOrder: ConfigurationStep[] = ['overview', 'targeting', 'knowledge', 'outcomes', 'testing', 'review'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const stepOrder: ConfigurationStep[] = ['overview', 'targeting', 'knowledge', 'outcomes', 'testing', 'review'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  if (loading && strategies.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-600">{error}</div>
          <button 
            onClick={() => setError(null)}
            className="mt-2 text-sm text-red-500 hover:text-red-700"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header Navigation */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Guided AI Stewardship</h1>
            <p className="text-gray-600">Configure intelligent patient screening workflows with advanced targeting and outcome management.</p>
          </div>
          {activeView === 'dashboard' && (
            <button
              onClick={() => setActiveView('wizard')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Create New Strategy</span>
            </button>
          )}
        </div>

        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveView('dashboard')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeView === 'dashboard'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Strategy Dashboard
          </button>
          <button
            onClick={() => setActiveView('wizard')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeView === 'wizard'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Configuration Wizard
          </button>
          <button
            onClick={() => setActiveView('analytics')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeView === 'analytics'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Analytics & Insights
          </button>
        </nav>
      </div>

      {/* Dashboard View */}
      {activeView === 'dashboard' && (
        <div>
          <div className="grid gap-6 mb-8 md:grid-cols-3">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Strategies</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {strategies.filter(s => s.is_active).length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Knowledge Sources</p>
                  <p className="text-2xl font-semibold text-gray-900">{knowledgeSources.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Executions</p>
                  <p className="text-2xl font-semibold text-gray-900">0</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Strategy Overview</h3>
            </div>
            
            {strategies.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 mb-4">No strategies configured yet</div>
                <button
                  onClick={() => setActiveView('wizard')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Create Your First Strategy
                </button>
              </div>
            ) : (
              <div className="p-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {strategies.map((strategy) => (
                    <div key={strategy.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-semibold text-gray-900">{strategy.name}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          strategy.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {strategy.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-3">{strategy.description}</p>
                      
                      <div className="text-xs text-gray-500 mb-3">
                        Created: {formatDate(strategy.created_at)}
                      </div>
                      
                      <div className="flex justify-between">
                        <button
                          onClick={() => handleEditStrategy(strategy.id!)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleUpdateStrategy(strategy.id!, { is_active: !strategy.is_active })}
                          className="text-gray-600 hover:text-gray-800 text-sm"
                        >
                          {strategy.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDeleteStrategy(strategy.id!)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Configuration Wizard */}
      {activeView === 'wizard' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Step Navigation Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Configuration Steps</h3>
              
              <nav className="space-y-2">
                {[
                  { key: 'overview', label: 'Strategy Overview', icon: '📋', available: true },
                  { key: 'targeting', label: 'Patient Targeting', icon: '🎯', available: true },
                  { key: 'knowledge', label: 'Knowledge Base', icon: '📚', available: true },
                  { key: 'outcomes', label: 'Outcome Actions', icon: '⚡', available: true },
                  { key: 'testing', label: 'Sandbox Testing', icon: '🧪', available: true },
                  { key: 'review', label: 'Review & Deploy', icon: '🚀', available: true }
                ].map((step) => {
                  const status = getStepStatus(step.key as ConfigurationStep);
                  const canAccess = step.available && canProceedToStep(step.key as ConfigurationStep);
                  
                  return (
                    <button
                      key={step.key}
                      onClick={() => canAccess && setCurrentStep(step.key as ConfigurationStep)}
                      disabled={!canAccess}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        status === 'current'
                          ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500'
                          : status === 'completed'
                          ? 'bg-green-50 text-green-700'
                          : status === 'valid' && step.available
                          ? 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                          : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{step.icon}</span>
                        <div>
                          <div className="font-medium">{step.label}</div>
                          <div className="text-xs">
                            {!step.available && 'Coming Soon'}
                            {step.available && status === 'current' && 'In Progress'}
                            {step.available && status === 'completed' && 'Completed'}
                            {step.available && status === 'valid' && 'Ready'}
                            {step.available && status === 'pending' && 'Pending'}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </nav>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    resetForm();
                    setActiveView('dashboard');
                  }}
                  className="w-full text-gray-600 hover:text-gray-800 text-sm"
                >
                  ← Back to Dashboard
                </button>
              </div>
            </div>
          </div>

          {/* Step Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              {/* Overview Step - Only active step for now */}
              {currentStep === 'overview' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Strategy Overview</h2>
                  <p className="text-gray-600 mb-8">Define the core information for your AI-guided patient screening strategy.</p>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Strategy Name *
                      </label>
                      <input
                        type="text"
                        value={strategyForm.name}
                        onChange={(e) => setStrategyForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., BRCA Hereditary Cancer Screening"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description *
                      </label>
                      <textarea
                        value={strategyForm.description}
                        onChange={(e) => setStrategyForm(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                        placeholder="Describe the purpose and scope of this screening strategy"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Strategy Goal *
                      </label>
                      <textarea
                        value={strategyForm.goal}
                        onChange={(e) => setStrategyForm(prev => ({ ...prev, goal: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        rows={4}
                        placeholder="Define the specific clinical goal this strategy aims to achieve..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Medical Specialty
                      </label>
                      <select
                        value={strategyForm.specialty}
                        onChange={(e) => setStrategyForm(prev => ({ ...prev, specialty: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="Oncology">Oncology</option>
                        <option value="Cardiology">Cardiology</option>
                        <option value="Endocrinology">Endocrinology</option>
                        <option value="Neurology">Neurology</option>
                        <option value="General Medicine">General Medicine</option>
                        <option value="Pediatrics">Pediatrics</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Patient Introduction Message *
                      </label>
                      <textarea
                        value={strategyForm.patient_introduction}
                        onChange={(e) => setStrategyForm(prev => ({ ...prev, patient_introduction: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                        placeholder="Welcome message displayed to patients when this strategy is triggered..."
                      />
                    </div>

                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={strategyForm.is_active}
                          onChange={(e) => setStrategyForm(prev => ({ ...prev, is_active: e.target.checked }))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-3 text-sm text-gray-700">
                          Activate strategy immediately after creation
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Patient Targeting Step */}
              {currentStep === 'targeting' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Patient Targeting Rules</h2>
                  <p className="text-gray-600 mb-8">Define criteria to identify which patients should trigger this strategy.</p>
                  
                  <div className="space-y-6">
                    {/* Targeting Rules */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Targeting Criteria</h3>
                        <button
                          onClick={addTargetingRule}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <span>Add Rule</span>
                        </button>
                      </div>

                      {strategyForm.targeting_rules.length === 0 ? (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                          <div className="text-gray-400 mb-2">🎯</div>
                          <p className="text-gray-500">No targeting rules defined yet.</p>
                          <p className="text-sm text-gray-400 mt-1">Add rules to specify which patients should trigger this strategy.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {strategyForm.targeting_rules.map((rule, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                              <div className="grid grid-cols-1 gap-4 mb-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Rule Name</label>
                                  <input
                                    type="text"
                                    value={rule.name}
                                    onChange={(e) => updateTargetingRule(index, 'name', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter a descriptive name for this rule"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Field</label>
                                  <select
                                    value={rule.field}
                                    onChange={(e) => updateTargetingRule(index, 'field', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                  >
                                    <option value="age">Age</option>
                                    <option value="gender">Gender</option>
                                    <option value="diagnosis">Diagnosis</option>
                                    <option value="appointment_type">Appointment Type</option>
                                    <option value="family_history">Family History</option>
                                    <option value="medications">Current Medications</option>
                                    <option value="lab_results">Lab Results</option>
                                    <option value="visit_frequency">Visit Frequency</option>
                                  </select>
                                </div>
                                
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Operator</label>
                                  <select
                                    value={rule.operator}
                                    onChange={(e) => updateTargetingRule(index, 'operator', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                  >
                                    <option value="is">is</option>
                                    <option value="is_not">is not</option>
                                    <option value="contains">contains</option>
                                    <option value="greater_than">greater than</option>
                                    <option value="less_than">less than</option>
                                    <option value="between">between</option>
                                  </select>
                                </div>
                                
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                                  <input
                                    type="text"
                                    value={typeof rule.value === 'string' ? rule.value : JSON.stringify(rule.value)}
                                    onChange={(e) => updateTargetingRule(index, 'value', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter target value..."
                                  />
                                </div>
                                
                                <div className="flex items-end">
                                  <button
                                    onClick={() => removeTargetingRule(index)}
                                    className="w-full bg-red-50 text-red-600 px-3 py-2 rounded-md hover:bg-red-100"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Rule Logic */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Rule Logic</h4>
                      <p className="text-blue-800 text-sm">
                        All targeting rules must be satisfied (AND logic) for a patient to trigger this strategy.
                        {strategyForm.targeting_rules.length === 0 && " No rules means this strategy can be triggered for any patient."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Knowledge Base Step */}
              {currentStep === 'knowledge' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Knowledge Base & Clinical Criteria</h2>
                  <p className="text-gray-600 mb-8">Select knowledge sources and define clinical criteria for AI decision-making.</p>
                  
                  <div className="space-y-6">
                    {/* Knowledge Sources Selection */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Available Knowledge Sources</h3>
                        <button
                          onClick={() => setShowFileUpload(true)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <span>Upload Document</span>
                        </button>
                      </div>

                      {knowledgeSources.length === 0 ? (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                          <div className="text-gray-400 mb-2">📚</div>
                          <p className="text-gray-500">No knowledge sources available.</p>
                          <p className="text-sm text-gray-400 mt-1">Upload clinical guidelines, protocols, or research documents.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {knowledgeSources.map((source) => (
                            <div key={source.id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900 mb-1">{source.name}</h4>
                                  <p className="text-sm text-gray-600 mb-2">{source.description}</p>
                                  <div className="text-xs text-gray-500">
                                    Size: {formatFileSize(source.file_size)} • 
                                    Created: {formatDate(source.created_at)}
                                  </div>
                                </div>
                                <label className="flex items-center ml-4">
                                  <input
                                    type="checkbox"
                                    checked={strategyForm.knowledge_source_ids.includes(source.id!)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setStrategyForm(prev => ({
                                          ...prev,
                                          knowledge_source_ids: [...prev.knowledge_source_ids, source.id!]
                                        }));
                                      } else {
                                        setStrategyForm(prev => ({
                                          ...prev,
                                          knowledge_source_ids: prev.knowledge_source_ids.filter(id => id !== source.id)
                                        }));
                                      }
                                    }}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                </label>
                              </div>
                              
                              <div className={`px-2 py-1 rounded text-xs ${
                                source.processing_status === 'completed' 
                                  ? 'bg-green-100 text-green-800'
                                  : source.processing_status === 'processing' || source.processing_status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {source.processing_status || 'unknown'}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Selected Sources Summary */}
                    {strategyForm.knowledge_source_ids.length > 0 && (
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-medium text-green-900 mb-2">Selected Knowledge Sources</h4>
                        <p className="text-green-800 text-sm mb-2">
                          {strategyForm.knowledge_source_ids.length} knowledge source(s) selected for this strategy.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {strategyForm.knowledge_source_ids.map(id => {
                            const source = knowledgeSources.find(s => s.id === id);
                            return source ? (
                              <span key={id} className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                                {source.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}

                    {/* Clinical Criteria Guidelines */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">AI Decision-Making Context</h4>
                      <p className="text-blue-800 text-sm">
                        The AI will use the selected knowledge sources along with patient data and targeting rules 
                        to make informed recommendations. Ensure knowledge sources contain relevant clinical guidelines, 
                        protocols, and evidence-based practices for optimal decision-making.
                      </p>
                    </div>

                    {/* Clinical Guidelines Section */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Select the Clinical Guidelines the AI should follow:</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        The AI will use these documents to formulate questions and assess patient answers.
                      </p>
                      
                      <div className="space-y-3">
                        {[
                          { id: 'nccn_guidelines_2025', name: 'NCCN Guidelines for Genetic/Familial High-Risk Assessment (v2.2025)' },
                          { id: 'acs_screening_guidelines', name: 'ACS Guidelines for Cancer Screening' },
                          { id: 'acog_hereditary_opinion', name: 'ACOG Committee Opinion on Hereditary Cancer Syndromes' },
                          { id: 'uspstf_recommendations', name: 'USPSTF Recommendations for BRCA-Related Cancer' },
                          { id: 'ashg_guidelines', name: 'ASHG Guidelines for Genetic Counseling' },
                          { id: 'nsabp_guidelines', name: 'NSABP Guidelines for High-Risk Assessment' }
                        ].map((guideline) => (
                          <label key={guideline.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                            <input
                              type="checkbox"
                              checked={strategyForm.clinical_guidelines.includes(guideline.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setStrategyForm(prev => ({
                                    ...prev,
                                    clinical_guidelines: [...prev.clinical_guidelines, guideline.id]
                                  }));
                                } else {
                                  setStrategyForm(prev => ({
                                    ...prev,
                                    clinical_guidelines: prev.clinical_guidelines.filter(id => id !== guideline.id)
                                  }));
                                }
                              }}
                              className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{guideline.name}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Risk Models Section */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Incorporate Risk Models:</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        The AI will ask questions to gather the necessary inputs for these models.
                      </p>
                      
                      <div className="space-y-3">
                        {[
                          { 
                            id: 'tyrer_cuzick_v8', 
                            name: 'Tyrer-Cuzick Model (v8)',
                            description: 'Comprehensive breast cancer risk assessment model'
                          },
                          { 
                            id: 'claus_model', 
                            name: 'Claus Model',
                            description: 'Family history-based breast cancer risk model'
                          },
                          { 
                            id: 'brcapro_model', 
                            name: 'BRCAPRO Model',
                            description: 'BRCA1/BRCA2 mutation probability model'
                          },
                          { 
                            id: 'gail_model', 
                            name: 'Gail Model',
                            description: 'Invasive breast cancer risk assessment'
                          },
                          { 
                            id: 'manchester_score', 
                            name: 'Manchester Scoring System',
                            description: 'BRCA1/BRCA2 mutation risk scoring'
                          },
                          { 
                            id: 'canrisk_model', 
                            name: 'CanRisk Model',
                            description: 'Comprehensive cancer risk prediction tool'
                          }
                        ].map((model) => (
                          <label key={model.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                            <input
                              type="checkbox"
                              checked={strategyForm.risk_models.includes(model.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setStrategyForm(prev => ({
                                    ...prev,
                                    risk_models: [...prev.risk_models, model.id]
                                  }));
                                } else {
                                  setStrategyForm(prev => ({
                                    ...prev,
                                    risk_models: prev.risk_models.filter(id => id !== model.id)
                                  }));
                                }
                              }}
                              className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{model.name}</div>
                              <div className="text-sm text-gray-600">{model.description}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Selected Guidelines and Models Summary */}
                    {(strategyForm.clinical_guidelines.length > 0 || strategyForm.risk_models.length > 0) && (
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-medium text-green-900 mb-2">Selected Configuration</h4>
                        {strategyForm.clinical_guidelines.length > 0 && (
                          <div className="mb-2">
                            <p className="text-green-800 text-sm font-medium">Clinical Guidelines ({strategyForm.clinical_guidelines.length}):</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {strategyForm.clinical_guidelines.map(id => {
                                const guideline = [
                                  { id: 'nccn_guidelines_2025', name: 'NCCN v2.2025' },
                                  { id: 'acs_screening_guidelines', name: 'ACS Screening' },
                                  { id: 'acog_hereditary_opinion', name: 'ACOG Hereditary' },
                                  { id: 'uspstf_recommendations', name: 'USPSTF BRCA' },
                                  { id: 'ashg_guidelines', name: 'ASHG Genetic Counseling' },
                                  { id: 'nsabp_guidelines', name: 'NSABP High-Risk' }
                                ].find(g => g.id === id);
                                return guideline ? (
                                  <span key={id} className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                                    {guideline.name}
                                  </span>
                                ) : null;
                              })}
                            </div>
                          </div>
                        )}
                        {strategyForm.risk_models.length > 0 && (
                          <div>
                            <p className="text-green-800 text-sm font-medium">Risk Models ({strategyForm.risk_models.length}):</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {strategyForm.risk_models.map(id => {
                                const model = [
                                  { id: 'tyrer_cuzick_v8', name: 'Tyrer-Cuzick v8' },
                                  { id: 'claus_model', name: 'Claus Model' },
                                  { id: 'brcapro_model', name: 'BRCAPRO' },
                                  { id: 'gail_model', name: 'Gail Model' },
                                  { id: 'manchester_score', name: 'Manchester Score' },
                                  { id: 'canrisk_model', name: 'CanRisk' }
                                ].find(m => m.id === id);
                                return model ? (
                                  <span key={id} className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                                    {model.name}
                                  </span>
                                ) : null;
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Outcomes & Actions Step */}
              {currentStep === 'outcomes' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Outcome Actions</h2>
                  <p className="text-gray-600 mb-8">Define what actions should be taken based on AI analysis results.</p>
                  
                  <div className="space-y-6">
                    {/* Outcome Actions */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Action Configuration</h3>
                        <button
                          onClick={addOutcomeAction}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <span>Add Action</span>
                        </button>
                      </div>

                      {strategyForm.outcome_actions.length === 0 ? (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                          <div className="text-gray-400 mb-2">⚡</div>
                          <p className="text-gray-500">No outcome actions defined yet.</p>
                          <p className="text-sm text-gray-400 mt-1">Add actions to specify what happens when criteria are met.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {strategyForm.outcome_actions.map((action, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                              <div className="grid grid-cols-1 gap-4 mb-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Action Name</label>
                                  <input
                                    type="text"
                                    value={action.name}
                                    onChange={(e) => updateOutcomeAction(index, 'name', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter a descriptive name for this action"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                                  <select
                                    value={action.condition}
                                    onChange={(e) => updateOutcomeAction(index, 'condition', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                  >
                                    <option value="meets_criteria">Meets Criteria</option>
                                    <option value="high_risk">High Risk</option>
                                    <option value="moderate_risk">Moderate Risk</option>
                                    <option value="low_risk">Low Risk</option>
                                    <option value="insufficient_data">Insufficient Data</option>
                                    <option value="requires_attention">Requires Attention</option>
                                  </select>
                                </div>
                                
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Action Type</label>
                                  <select
                                    value={action.action_type}
                                    onChange={(e) => updateOutcomeAction(index, 'action_type', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                  >
                                    <option value="create_task">Create Task</option>
                                    <option value="send_message">Send Message</option>
                                    <option value="schedule_followup">Schedule Follow-up</option>
                                    <option value="alert_provider">Alert Provider</option>
                                    <option value="refer_specialist">Refer to Specialist</option>
                                    <option value="order_test">Order Test</option>
                                    <option value="update_care_plan">Update Care Plan</option>
                                  </select>
                                </div>
                                
                                <div className="flex items-end">
                                  <button
                                    onClick={() => removeOutcomeAction(index)}
                                    className="w-full bg-red-50 text-red-600 px-3 py-2 rounded-md hover:bg-red-100"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                              
                              {/* Action Details based on type */}
                              <div className="bg-gray-50 p-3 rounded">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Action Details</label>
                                {action.action_type === 'create_task' && (
                                  <div className="space-y-2">
                                    <input
                                      type="text"
                                      placeholder="Task title"
                                      value={action.details.title || ''}
                                      onChange={(e) => updateOutcomeAction(index, 'details', { ...action.details, title: e.target.value })}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <textarea
                                      placeholder="Task description"
                                      value={action.details.description || ''}
                                      onChange={(e) => updateOutcomeAction(index, 'details', { ...action.details, description: e.target.value })}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                      rows={2}
                                    />
                                  </div>
                                )}
                                {action.action_type === 'send_message' && (
                                  <textarea
                                    placeholder="Message content"
                                    value={action.details.message || ''}
                                    onChange={(e) => updateOutcomeAction(index, 'details', { ...action.details, message: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    rows={3}
                                  />
                                )}
                                {action.action_type === 'schedule_followup' && (
                                  <div className="space-y-2">
                                    <input
                                      type="number"
                                      placeholder="Days from now"
                                      value={action.details.days || ''}
                                      onChange={(e) => updateOutcomeAction(index, 'details', { ...action.details, days: parseInt(e.target.value) || '' })}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <input
                                      type="text"
                                      placeholder="Appointment type"
                                      value={action.details.appointmentType || ''}
                                      onChange={(e) => updateOutcomeAction(index, 'details', { ...action.details, appointmentType: e.target.value })}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                  </div>
                                )}
                                {action.action_type === 'refer_specialist' && (
                                  <div className="space-y-2">
                                    <input
                                      type="text"
                                      placeholder="Specialist type"
                                      value={action.details.specialistType || ''}
                                      onChange={(e) => updateOutcomeAction(index, 'details', { ...action.details, specialistType: e.target.value })}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <select
                                      value={action.details.urgency || 'routine'}
                                      onChange={(e) => updateOutcomeAction(index, 'details', { ...action.details, urgency: e.target.value })}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    >
                                      <option value="routine">Routine</option>
                                      <option value="urgent">Urgent</option>
                                      <option value="stat">STAT</option>
                                    </select>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action Flow Summary */}
                    {strategyForm.outcome_actions.length > 0 && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Action Flow Summary</h4>
                        <p className="text-blue-800 text-sm mb-2">
                          {strategyForm.outcome_actions.length} action(s) configured. Actions will be executed in sequence when their conditions are met.
                        </p>
                        <div className="space-y-1">
                          {strategyForm.outcome_actions.map((action, index) => (
                            <div key={index} className="text-sm text-blue-700">
                              {index + 1}. When <strong>{action.condition.replace('_', ' ')}</strong> → <strong>{action.action_type.replace('_', ' ')}</strong>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Sandbox Testing Step */}
              {currentStep === 'testing' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Sandbox Testing</h2>
                  <p className="text-gray-600 mb-8">Test your strategy with simulated patient scenarios before deployment.</p>
                  
                  <div className="space-y-6">
                    {/* Test Configuration */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="text-2xl">🧪</div>
                        <div>
                          <h3 className="text-lg font-medium text-yellow-900">Strategy Testing</h3>
                          <p className="text-yellow-800 text-sm">Run simulated scenarios to validate your strategy configuration.</p>
                        </div>
                      </div>
                      
                      <button
                        onClick={handleTestStrategy}
                        disabled={loading || !stepValidation.overview}
                        className="bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 disabled:bg-gray-400 flex items-center space-x-2"
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Running Tests...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Run Strategy Test</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Test Results */}
                    {testResults && (
                      <div className={`p-6 rounded-lg border ${
                        testResults.success 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-red-50 border-red-200'
                      }`}>
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="text-2xl">
                            {testResults.success ? '✅' : '❌'}
                          </div>
                          <div>
                            <h3 className={`text-lg font-medium ${
                              testResults.success ? 'text-green-900' : 'text-red-900'
                            }`}>
                              Test Results
                            </h3>
                            <p className={`text-sm ${
                              testResults.success ? 'text-green-800' : 'text-red-800'
                            }`}>
                              {testResults.message}
                            </p>
                          </div>
                        </div>

                        {testResults.scenarios && (
                          <div className="space-y-3">
                            <h4 className={`font-medium ${
                              testResults.success ? 'text-green-900' : 'text-red-900'
                            }`}>
                              Scenario Results:
                            </h4>
                            {testResults.scenarios.map((scenario: any, index: number) => (
                              <div key={index} className={`p-3 rounded border ${
                                testResults.success ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'
                              }`}>
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="font-medium">{scenario.name}</div>
                                    <div className="text-sm opacity-75">Result: {scenario.result.replace('_', ' ')}</div>
                                  </div>
                                  <div className="text-sm">
                                    Actions: {scenario.actions.join(', ') || 'None'}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {testResults.error && (
                          <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded">
                            <div className="text-red-800 text-sm">
                              Error: {testResults.error}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Testing Guidelines */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Testing Guidelines</h4>
                      <ul className="text-blue-800 text-sm space-y-1">
                        <li>• Strategy testing validates targeting rules, knowledge base integration, and outcome actions</li>
                        <li>• Multiple patient scenarios are simulated to ensure comprehensive coverage</li>
                        <li>• Test results help identify potential issues before production deployment</li>
                        <li>• All targeting and outcome configurations should be validated through testing</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Review Step */}
              {currentStep === 'review' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Review & Deploy</h2>
                  <p className="text-gray-600 mb-8">Review your complete strategy configuration and deploy it to production.</p>
                  
                  <div className="space-y-6">
                    {/* Strategy Overview Summary */}
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Strategy Overview</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Name</label>
                          <p className="text-gray-900">{strategyForm.name || 'Not specified'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Description</label>
                          <p className="text-gray-900">{strategyForm.description || 'No description provided'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Goal</label>
                          <p className="text-gray-900">{strategyForm.goal || 'Not specified'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Medical Specialty</label>
                          <p className="text-gray-900">{strategyForm.specialty}</p>
                        </div>
                        {strategyForm.patient_introduction && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">Patient Introduction</label>
                            <p className="text-gray-900">{strategyForm.patient_introduction}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Patient Targeting Summary */}
                    <div className="bg-blue-50 p-6 rounded-lg">
                      <h3 className="text-lg font-medium text-blue-900 mb-4">Patient Targeting</h3>
                      {strategyForm.targeting_rules.length === 0 ? (
                        <p className="text-blue-800 text-sm">No targeting rules defined - strategy can be triggered for any patient.</p>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-blue-800 text-sm mb-3">{strategyForm.targeting_rules.length} targeting rule(s) configured:</p>
                          {strategyForm.targeting_rules.map((rule, index) => (
                            <div key={index} className="text-sm text-blue-700 bg-blue-100 px-3 py-2 rounded">
                              <div className="font-medium">{rule.name || `Rule ${index + 1}`}</div>
                              <div><strong>{rule.field}</strong> {rule.operator.replace('_', ' ')} <strong>{typeof rule.value === 'string' ? rule.value : JSON.stringify(rule.value)}</strong></div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Knowledge Base Summary */}
                    <div className="bg-green-50 p-6 rounded-lg">
                      <h3 className="text-lg font-medium text-green-900 mb-4">Knowledge Base & Clinical Criteria</h3>
                      
                      {/* Knowledge Sources */}
                      <div className="mb-4">
                        <h4 className="font-medium text-green-800 mb-2">Knowledge Sources</h4>
                        {strategyForm.knowledge_source_ids.length === 0 ? (
                          <p className="text-green-800 text-sm">No knowledge sources selected - AI will use general medical knowledge.</p>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-green-800 text-sm mb-2">{strategyForm.knowledge_source_ids.length} knowledge source(s) selected:</p>
                            <div className="flex flex-wrap gap-2">
                              {strategyForm.knowledge_source_ids.map(id => {
                                const source = knowledgeSources.find(s => s.id === id);
                                return source ? (
                                  <span key={id} className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm">
                                    {source.name}
                                  </span>
                                ) : null;
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Clinical Guidelines */}
                      <div className="mb-4">
                        <h4 className="font-medium text-green-800 mb-2">Clinical Guidelines</h4>
                        {strategyForm.clinical_guidelines.length === 0 ? (
                          <p className="text-green-800 text-sm">No clinical guidelines selected.</p>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-green-800 text-sm mb-2">{strategyForm.clinical_guidelines.length} guideline(s) selected:</p>
                            <div className="flex flex-wrap gap-2">
                              {strategyForm.clinical_guidelines.map(id => {
                                const guideline = [
                                  { id: 'nccn_guidelines_2025', name: 'NCCN v2.2025' },
                                  { id: 'acs_screening_guidelines', name: 'ACS Screening' },
                                  { id: 'acog_hereditary_opinion', name: 'ACOG Hereditary' },
                                  { id: 'uspstf_recommendations', name: 'USPSTF BRCA' },
                                  { id: 'ashg_guidelines', name: 'ASHG Genetic Counseling' },
                                  { id: 'nsabp_guidelines', name: 'NSABP High-Risk' }
                                ].find(g => g.id === id);
                                return guideline ? (
                                  <span key={id} className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm">
                                    {guideline.name}
                                  </span>
                                ) : null;
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Risk Models */}
                      <div>
                        <h4 className="font-medium text-green-800 mb-2">Risk Models</h4>
                        {strategyForm.risk_models.length === 0 ? (
                          <p className="text-green-800 text-sm">No risk models selected.</p>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-green-800 text-sm mb-2">{strategyForm.risk_models.length} risk model(s) selected:</p>
                            <div className="flex flex-wrap gap-2">
                              {strategyForm.risk_models.map(id => {
                                const model = [
                                  { id: 'tyrer_cuzick_v8', name: 'Tyrer-Cuzick v8' },
                                  { id: 'claus_model', name: 'Claus Model' },
                                  { id: 'brcapro_model', name: 'BRCAPRO' },
                                  { id: 'gail_model', name: 'Gail Model' },
                                  { id: 'manchester_score', name: 'Manchester Score' },
                                  { id: 'canrisk_model', name: 'CanRisk' }
                                ].find(m => m.id === id);
                                return model ? (
                                  <span key={id} className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm">
                                    {model.name}
                                  </span>
                                ) : null;
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Outcome Actions Summary */}
                    <div className="bg-purple-50 p-6 rounded-lg">
                      <h3 className="text-lg font-medium text-purple-900 mb-4">Outcome Actions</h3>
                      {strategyForm.outcome_actions.length === 0 ? (
                        <p className="text-purple-800 text-sm">No outcome actions defined - no automatic actions will be taken.</p>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-purple-800 text-sm mb-3">{strategyForm.outcome_actions.length} outcome action(s) configured:</p>
                          {strategyForm.outcome_actions.map((action, index) => (
                            <div key={index} className="text-sm text-purple-700 bg-purple-100 px-3 py-2 rounded">
                              <div className="font-medium">{action.name || `Action ${index + 1}`}</div>
                              <div>When <strong>{action.condition.replace('_', ' ')}</strong> → <strong>{action.action_type.replace('_', ' ')}</strong></div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Test Results Summary */}
                    {testResults && (
                      <div className={`p-6 rounded-lg ${
                        testResults.success 
                          ? 'bg-green-50 border border-green-200' 
                          : 'bg-red-50 border border-red-200'
                      }`}>
                        <h3 className={`text-lg font-medium mb-4 ${
                          testResults.success ? 'text-green-900' : 'text-red-900'
                        }`}>Testing Results</h3>
                        <p className={`text-sm ${
                          testResults.success ? 'text-green-800' : 'text-red-800'
                        }`}>
                          {testResults.message}
                        </p>
                        {testResults.success && (
                          <div className="mt-2 text-sm text-green-700">
                            ✅ Strategy passed sandbox testing and is ready for deployment
                          </div>
                        )}
                      </div>
                    )}

                    {/* Deployment Options */}
                    <div className="border border-gray-200 p-6 rounded-lg">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Deployment Options</h3>
                      <div className="space-y-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={strategyForm.is_active}
                            onChange={(e) => setStrategyForm(prev => ({ ...prev, is_active: e.target.checked }))}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-3 text-sm text-gray-700">
                          Activate strategy immediately after creation
                        </span>
                      </label>
                      
                      <div className={`p-3 rounded border ${
                        stepValidation.overview && testResults?.success
                          ? 'border-green-200 bg-green-50'
                          : 'border-blue-200 bg-blue-50'
                      }`}>
                        <div className="flex items-center space-x-2">
                          <svg className={`w-4 h-4 ${
                            stepValidation.overview && testResults?.success ? 'text-green-600' : 'text-blue-600'
                          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className={`text-sm ${
                            stepValidation.overview && testResults?.success ? 'text-green-700' : 'text-blue-700'
                          }`}>
                            {stepValidation.overview && testResults?.success
                              ? 'Strategy is fully configured and tested - ready for production deployment'
                              : 'Strategy has basic configuration and is ready for deployment'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step Navigation */}
              <div className="flex justify-between pt-8 border-t border-gray-200">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 'overview'}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>
                
                <div className="flex space-x-4">
                  {currentStep === 'review' ? (
                    <button
                      onClick={handleCreateStrategy}
                      disabled={loading || !stepValidation.overview}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      {loading ? 'Creating...' : 'Create Strategy'}
                    </button>
                  ) : (
                    <button
                      onClick={nextStep}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Next →
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics View */}
      {activeView === 'analytics' && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics & Insights</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <p className="text-gray-600">Advanced analytics and performance insights coming soon...</p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold text-gray-900">0</div>
                <div className="text-sm text-gray-600">Total Executions</div>
              </div>
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold text-gray-900">0%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold text-gray-900">0</div>
                <div className="text-sm text-gray-600">Actions Triggered</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* File Upload Modal */}
      {showFileUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Upload Knowledge Source</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select File
              </label>
              <input
                type="file"
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.txt,.md"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={uploadingFile}
              />
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: PDF, DOC, DOCX, TXT, MD
              </p>
            </div>

            {uploadingFile && (
              <div className="mb-4 text-center">
                <div className="text-sm text-gray-600">Uploading...</div>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={() => setShowFileUpload(false)}
                disabled={uploadingFile}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 disabled:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatConfigurationManagerNew;
