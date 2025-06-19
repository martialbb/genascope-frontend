import React, { useState, useEffect } from 'react';
import { chatConfigurationAPI } from '../services/chatConfigurationApi';
import type { 
  ChatStrategy, 
  KnowledgeSource, 
  ChatStrategyCreate, 
  ChatStrategyUpdate,
  KnowledgeSourceCreate,
  FileUploadRequest
} from '../services/chatConfigurationApi';

const ChatConfigurationManager: React.FC = () => {
  const [strategies, setStrategies] = useState<ChatStrategy[]>([]);
  const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSource[]>([]);
  const [activeView, setActiveView] = useState<'dashboard' | 'configure' | 'analytics'>('dashboard');
  const [selectedStrategy, setSelectedStrategy] = useState<ChatStrategy | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Configuration form state
  const [configForm, setConfigForm] = useState({
    name: '',
    description: '',
    goal: '',
    is_active: true
  });

  // File upload state
  const [uploadingFile, setUploadingFile] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadStrategies();
    loadKnowledgeSources();
  }, []);

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

  const handleCreateStrategy = async () => {
    try {
      setLoading(true);
      const newStrategy = await chatConfigurationAPI.createStrategy(configForm);
      setStrategies(prev => [...prev, newStrategy]);
      setConfigForm({ name: '', description: '', goal: '', is_active: true });
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatFileSize = (sizeInBytes?: number) => {
    if (!sizeInBytes) return 'N/A';
    return `${(sizeInBytes / 1024 / 1024).toFixed(2)} MB`;
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

      {/* Navigation */}
      <div className="mb-8">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveView('dashboard')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeView === 'dashboard'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveView('configure')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeView === 'configure'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Configure
          </button>
          <button
            onClick={() => setActiveView('analytics')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeView === 'analytics'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Analytics
          </button>
        </nav>
      </div>

      {/* Dashboard View */}
      {activeView === 'dashboard' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Chat Strategies</h2>
            <button
              onClick={() => setActiveView('configure')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Create New Strategy
            </button>
          </div>

          {strategies.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">No chat strategies found</div>
              <button
                onClick={() => setActiveView('configure')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Create Your First Strategy
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {strategies.map((strategy) => (
                <div key={strategy.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{strategy.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      strategy.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {strategy.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4 text-sm">{strategy.description}</p>
                  
                  <div className="text-xs text-gray-500 mb-4">
                    Created: {formatDate(strategy.created_at)}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedStrategy(strategy);
                        setConfigForm({
                          name: strategy.name,
                          description: strategy.description || '',
                          goal: strategy.goal,
                          is_active: strategy.is_active || false
                        });
                        setActiveView('configure');
                      }}
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
          )}
        </div>
      )}

      {/* Configure View */}
      {activeView === 'configure' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedStrategy ? 'Edit Strategy' : 'Create New Strategy'}
            </h2>
            <button
              onClick={() => {
                setActiveView('dashboard');
                setSelectedStrategy(null);
                setConfigForm({ name: '', description: '', goal: '', is_active: true });
              }}
              className="text-gray-600 hover:text-gray-800"
            >
              Back to Dashboard
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-2xl">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Strategy Name
                </label>
                <input
                  type="text"
                  value={configForm.name}
                  onChange={(e) => setConfigForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter strategy name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={configForm.description}
                  onChange={(e) => setConfigForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Describe what this strategy does"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Goal
                </label>
                <textarea
                  value={configForm.goal}
                  onChange={(e) => setConfigForm(prev => ({ ...prev, goal: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  placeholder="Define the specific goal for this chat strategy"
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={configForm.is_active}
                    onChange={(e) => setConfigForm(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={selectedStrategy ? () => handleUpdateStrategy(selectedStrategy.id!, configForm) : handleCreateStrategy}
                  disabled={!configForm.name || !configForm.goal || loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loading ? 'Saving...' : (selectedStrategy ? 'Update Strategy' : 'Create Strategy')}
                </button>
                <button
                  onClick={() => {
                    setActiveView('dashboard');
                    setSelectedStrategy(null);
                    setConfigForm({ name: '', description: '', goal: '', is_active: true });
                  }}
                  className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics View */}
      {activeView === 'analytics' && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <p className="text-gray-600">Analytics features coming soon...</p>
          </div>
        </div>
      )}

      {/* Knowledge Sources Section */}
      <div className="mt-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Knowledge Sources</h2>
          <button
            onClick={() => setShowFileUpload(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Upload File
          </button>
        </div>

        {knowledgeSources.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="text-gray-500 mb-4">No knowledge sources found</div>
            <button
              onClick={() => setShowFileUpload(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Upload Your First Document
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {knowledgeSources.map((source) => (
              <div key={source.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{source.name}</h3>
                    <p className="text-sm text-gray-600">{source.description}</p>
                    <div className="text-xs text-gray-500 mt-2">
                      Size: {formatFileSize(source.file_size)} | 
                      Status: {source.processing_status} | 
                      Created: {formatDate(source.created_at)}
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    source.processing_status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : source.processing_status === 'failed'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {source.processing_status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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

export default ChatConfigurationManager;
