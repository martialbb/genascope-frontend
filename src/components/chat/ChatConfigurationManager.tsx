// Main Chat Configuration Manager - simplified container component

import React, { useState, useEffect } from 'react';
import { ChatDashboard } from './ChatDashboard';
import { ChatWizard } from './ChatWizard';
import { useChatStrategy } from '../../hooks/useChatStrategy';
import type { StrategyFormData, ChatStrategy } from '../../types/chatConfiguration';
import { buttonStyles } from '../../constants/buttonStyles';

type ActiveView = 'dashboard' | 'wizard' | 'analytics';

export const ChatConfigurationManager: React.FC = () => {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [editingStrategy, setEditingStrategy] = useState<ChatStrategy | null>(null);
  const [strategyForm, setStrategyForm] = useState<StrategyFormData>({
    name: '',
    description: '',
    goal: '',
    patient_introduction: '',
    specialty: 'Oncology',
    is_active: false,
    targeting_rules: [],
    knowledge_source_ids: [],
    outcome_actions: [],
    knowledge_completed: false,
    outcomes_completed: false,
    testing_completed: false,
    review_completed: false
  });

  const {
    strategies,
    knowledgeSources,
    loading,
    error,
    loadStrategies,
    loadKnowledgeSources,
    saveStrategy,
    deleteStrategy,
    toggleStrategy,
    setError
  } = useChatStrategy();

  // Load data on component mount
  useEffect(() => {
    if (activeView === 'dashboard') {
      loadStrategies();
    }
    loadKnowledgeSources();
  }, [activeView, loadStrategies, loadKnowledgeSources]);

  const handleCreateNewStrategy = () => {
    setEditingStrategy(null);
    setStrategyForm({
      name: '',
      description: '',
      goal: '',
      patient_introduction: '',
      specialty: 'Oncology',
      is_active: false,
      targeting_rules: [],
      knowledge_source_ids: [],
      outcome_actions: [],
      knowledge_completed: false,
      outcomes_completed: false,
      testing_completed: false,
      review_completed: false
    });
    setActiveView('wizard');
  };

  const handleEditStrategy = (strategy: ChatStrategy) => {
    setEditingStrategy(strategy);
    setStrategyForm({
      name: strategy.name,
      description: strategy.description || '',
      goal: strategy.goal || '',
      patient_introduction: strategy.patient_introduction || '',
      specialty: strategy.specialty || 'Oncology',
      is_active: strategy.is_active || false,
      targeting_rules: strategy.targeting_rules || [],
      knowledge_source_ids: strategy.knowledge_sources?.map(ks => ks.id).filter((id): id is string => Boolean(id)) || [],
      outcome_actions: strategy.outcome_actions || [],
      knowledge_completed: false, // Reset completion status when editing
      outcomes_completed: false,
      testing_completed: false,
      review_completed: false
    });
    setActiveView('wizard');
  };

  const handleSaveStrategy = async () => {
    const success = await saveStrategy(strategyForm, editingStrategy);
    if (success) {
      setEditingStrategy(null);
      setStrategyForm({
        name: '',
        description: '',
        goal: '',
        patient_introduction: '',
        specialty: 'Oncology',
        is_active: false,
        targeting_rules: [],
        knowledge_source_ids: [],
        outcome_actions: [],
        knowledge_completed: false,
        outcomes_completed: false,
        testing_completed: false,
        review_completed: false
      });
      setActiveView('dashboard');
    }
  };

  const handleDeleteStrategy = async (id: string) => {
    if (!confirm('Are you sure you want to delete this strategy?')) return;
    await deleteStrategy(id);
  };

  const handleFormChange = (field: keyof StrategyFormData, value: any) => {
    setStrategyForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBackToDashboard = () => {
    setActiveView('dashboard');
    setEditingStrategy(null);
  };

  const handleFileUpload = async (files: FileList): Promise<void> => {
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log('Uploading file:', file.name);
        
        // Upload file using the real API
        const uploadResponse = await apiService.uploadFile({
          file,
          name: file.name,
          description: `Uploaded file: ${file.name}`,
          access_level: 'private'
        });
        
        // Create knowledge source from upload response
        const newKnowledgeSource = {
          id: uploadResponse.id,
          name: uploadResponse.name,
          description: `Uploaded file: ${uploadResponse.name}`,
          source_type: 'file' as const,
          file_size: file.size,
          created_at: new Date().toISOString(),
          file_path: uploadResponse.file_path,
          processing_status: uploadResponse.processing_status
        };
        
        // Add to knowledge sources list
        knowledgeSources.push(newKnowledgeSource);
        
        // Automatically add to selected sources
        setStrategyForm(prev => ({
          ...prev,
          knowledge_source_ids: [...prev.knowledge_source_ids, uploadResponse.id]
        }));
      }
    } catch (error) {
      console.error('File upload failed:', error);
      throw new Error('File upload failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Chat Configuration Manager</h1>
              <p className="text-gray-600 mt-2">Create and manage AI chat strategies for your healthcare practice</p>
            </div>
          </div>
          
          {/* Main Navigation Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveView('dashboard')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                  activeView === 'dashboard'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z" />
                  </svg>
                  <span>Dashboard</span>
                </div>
              </button>
              
              <button
                onClick={() => {
                  if (activeView !== 'wizard') {
                    handleCreateNewStrategy();
                  }
                }}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                  activeView === 'wizard'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>{activeView === 'wizard' ? (editingStrategy ? 'Edit Strategy' : 'Create Strategy') : 'Create New'}</span>
                </div>
              </button>

              <button
                onClick={() => setActiveView('analytics')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                  activeView === 'analytics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>Analytics</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-600"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        {activeView === 'dashboard' && (
          <ChatDashboard
            strategies={strategies}
            loading={loading}
            onCreateNew={handleCreateNewStrategy}
            onEdit={handleEditStrategy}
            onDelete={handleDeleteStrategy}
            onToggle={toggleStrategy}
          />
        )}

        {activeView === 'wizard' && (
          <ChatWizard
            formData={strategyForm}
            onFormChange={handleFormChange}
            onSave={handleSaveStrategy}
            onCancel={handleBackToDashboard}
            knowledgeSources={knowledgeSources}
            isEditing={!!editingStrategy}
            loading={loading}
            onFileUpload={handleFileUpload}
          />
        )}

        {activeView === 'analytics' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Key Metrics Cards */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Strategies</p>
                    <p className="text-3xl font-bold">{strategies.length}</p>
                  </div>
                  <div className="bg-blue-400 bg-opacity-50 rounded-lg p-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Active Strategies</p>
                    <p className="text-3xl font-bold">{strategies.filter(s => s.is_active).length}</p>
                  </div>
                  <div className="bg-green-400 bg-opacity-50 rounded-lg p-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Knowledge Sources</p>
                    <p className="text-3xl font-bold">{knowledgeSources.length}</p>
                  </div>
                  <div className="bg-purple-400 bg-opacity-50 rounded-lg p-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">Specialties</p>
                    <p className="text-3xl font-bold">{new Set(strategies.map(s => s.specialty)).size}</p>
                  </div>
                  <div className="bg-orange-400 bg-opacity-50 rounded-lg p-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center py-12">
              <p className="text-gray-500">Advanced analytics coming soon...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
