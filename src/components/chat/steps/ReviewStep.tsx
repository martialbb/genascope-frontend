// Review Step Component - final review and deployment

import React from 'react';
import type { StrategyFormData, KnowledgeSource } from '../../../types/chatConfiguration';
import { buttonStyles } from '../../../constants/buttonStyles';

interface ReviewStepProps {
  formData: StrategyFormData;
  onFormChange: (field: keyof StrategyFormData, value: any) => void;
  knowledgeSources: KnowledgeSource[];
  onSave: () => Promise<void> | void;
  isEditing: boolean;
  loading: boolean;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  formData,
  onFormChange,
  knowledgeSources,
  onSave,
  isEditing,
  loading
}) => {
  const selectedKnowledgeSources = knowledgeSources.filter(source =>
    formData.knowledge_source_ids.includes(source.id || '')
  );

  const handleCompleteReview = () => {
    onFormChange('review_completed', true);
  };

  const handleDeploy = async () => {
    await onSave();
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-100 to-purple-200 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Review & Deploy</h3>
        <p className="text-gray-600 text-lg">Review your strategy configuration and deploy when ready.</p>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Strategy Overview */}
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Strategy Overview</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-medium text-gray-700 mb-2">Basic Information</h5>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Name:</span> {formData.name}</div>
                <div><span className="font-medium">Specialty:</span> {formData.specialty}</div>
                <div><span className="font-medium">Status:</span> {formData.is_active ? 'Active' : 'Inactive'}</div>
              </div>
            </div>
            <div>
              <h5 className="font-medium text-gray-700 mb-2">Configuration</h5>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Targeting Rules:</span> {formData.targeting_rules.length} rules</div>
                <div><span className="font-medium">Knowledge Sources:</span> {formData.knowledge_source_ids.length} sources</div>
                <div><span className="font-medium">Outcome Actions:</span> {formData.outcome_actions.length} actions</div>
              </div>
            </div>
          </div>
        </div>

        {/* Description and Goal */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Description & Goal</h4>
          <div className="space-y-4">
            <div>
              <h5 className="font-medium text-gray-700 mb-2">Description</h5>
              <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{formData.description}</p>
            </div>
            <div>
              <h5 className="font-medium text-gray-700 mb-2">Goal</h5>
              <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{formData.goal}</p>
            </div>
            <div>
              <h5 className="font-medium text-gray-700 mb-2">Patient Introduction</h5>
              <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{formData.patient_introduction}</p>
            </div>
          </div>
        </div>

        {/* Targeting Rules */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Targeting Rules ({formData.targeting_rules.length})</h4>
          {formData.targeting_rules.length > 0 ? (
            <div className="space-y-3">
              {formData.targeting_rules.map((rule, index) => (
                <div key={index} className="bg-purple-50 p-3 rounded-lg">
                  <span className="font-medium text-purple-700">
                    {rule.field} {rule.operator} "{typeof rule.value === 'string' ? rule.value : JSON.stringify(rule.value)}"
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No targeting rules defined</p>
          )}
        </div>

        {/* Knowledge Sources */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Knowledge Sources ({selectedKnowledgeSources.length})</h4>
          {selectedKnowledgeSources.length > 0 ? (
            <div className="space-y-3">
              {selectedKnowledgeSources.map((source) => (
                <div key={source.id} className="bg-green-50 p-3 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h6 className="font-medium text-green-700">{source.name}</h6>
                      <p className="text-sm text-green-600">{source.description}</p>
                    </div>
                    <span className="text-xs text-green-600 capitalize">
                      {source.source_type || 'file'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No knowledge sources selected</p>
          )}
        </div>

        {/* Outcome Actions */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Outcome Actions ({formData.outcome_actions.length})</h4>
          {formData.outcome_actions.length > 0 ? (
            <div className="space-y-3">
              {formData.outcome_actions.map((action, index) => (
                <div key={index} className="bg-orange-50 p-3 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-medium text-orange-700">
                        When {action.condition} → {action.action_type}
                      </span>
                      {action.details && Object.keys(action.details).length > 0 && (
                        <div className="text-sm text-orange-600 mt-1">
                          {Object.entries(action.details).map(([key, value]) => (
                            <div key={key}>{key}: {String(value)}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No outcome actions defined</p>
          )}
        </div>

        {/* Deployment Status */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Deployment Status</h4>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-700">
                {formData.review_completed 
                  ? '✅ Review completed - Ready for deployment'
                  : '⏳ Review pending - Complete review to enable deployment'
                }
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {isEditing ? 'Updating existing strategy' : 'Creating new strategy'}
              </p>
            </div>
            <div className="flex gap-3">
              {!formData.review_completed && (
                <button
                  onClick={handleCompleteReview}
                  className={buttonStyles.secondary}
                >
                  Complete Review
                </button>
              )}
              <button
                onClick={handleDeploy}
                disabled={loading || !formData.review_completed}
                className={`${buttonStyles.primary} ${
                  !formData.review_completed || loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Deploying...' : isEditing ? 'Update Strategy' : 'Deploy Strategy'}
              </button>
            </div>
          </div>
        </div>

        {/* Pre-deployment Checklist */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h5 className="font-semibold text-blue-800 mb-2">📋 Pre-deployment Checklist:</h5>
          <ul className="text-sm text-blue-700 space-y-1">
            <li className={formData.name ? '✅' : '❌'}> Strategy name and description are clear and descriptive</li>
            <li className={formData.targeting_rules.length > 0 ? '✅' : '❌'}> Targeting rules are properly configured</li>
            <li className={formData.knowledge_source_ids.length > 0 ? '✅' : '❌'}> Knowledge sources are selected and accessible</li>
            <li className={formData.outcome_actions.length > 0 ? '✅' : '❌'}> Outcome actions are configured for all scenarios</li>
            <li className={formData.testing_completed ? '✅' : '❌'}> Strategy has been tested with sample scenarios</li>
            <li className={formData.review_completed ? '✅' : '❌'}> Final review has been completed</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
