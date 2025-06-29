// Outcomes Step Component - handles outcome actions configuration

import React from 'react';
import type { StrategyFormData, OutcomeAction } from '../../../types/chatConfiguration';
import { buttonStyles } from '../../../constants/buttonStyles';

interface OutcomesStepProps {
  formData: StrategyFormData;
  onFormChange: (field: keyof StrategyFormData, value: any) => void;
}

export const OutcomesStep: React.FC<OutcomesStepProps> = ({
  formData,
  onFormChange
}) => {
  const conditionOptions = [
    { value: 'meets_criteria', label: 'Meets Criteria' },
    { value: 'does_not_meet_criteria', label: 'Does Not Meet Criteria' },
    { value: 'incomplete_data', label: 'Incomplete Data' }
  ];

  const actionTypeOptions = [
    { value: 'create_task', label: 'Create Task' },
    { value: 'send_notification', label: 'Send Notification' },
    { value: 'schedule_appointment', label: 'Schedule Appointment' },
    { value: 'generate_report', label: 'Generate Report' },
    { value: 'update_patient_record', label: 'Update Patient Record' },
    { value: 'trigger_workflow', label: 'Trigger Workflow' },
    { value: 'send_email', label: 'Send Email' },
    { value: 'create_reminder', label: 'Create Reminder' }
  ];

  const addOutcomeAction = () => {
    const newAction: OutcomeAction = {
      condition: 'meets_criteria',
      action_type: 'create_task',
      details: {},
      sequence: formData.outcome_actions.length + 1
    };
    onFormChange('outcome_actions', [...formData.outcome_actions, newAction]);
  };

  const updateOutcomeAction = (index: number, field: keyof OutcomeAction, value: any) => {
    const updatedActions = formData.outcome_actions.map((action, i) =>
      i === index ? { ...action, [field]: value } : action
    );
    onFormChange('outcome_actions', updatedActions);
  };

  const updateActionDetails = (index: number, key: string, value: any) => {
    const updatedActions = formData.outcome_actions.map((action, i) =>
      i === index ? {
        ...action,
        details: { ...action.details, [key]: value }
      } : action
    );
    onFormChange('outcome_actions', updatedActions);
  };

  const removeOutcomeAction = (index: number) => {
    const updatedActions = formData.outcome_actions.filter((_, i) => i !== index);
    onFormChange('outcome_actions', updatedActions);
  };

  const renderActionConfiguration = (action: OutcomeAction, index: number) => {
    switch (action.action_type) {
      case 'create_task':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Task Type</label>
              <select
                value={action.details?.task_type || ''}
                onChange={(e) => updateActionDetails(index, 'task_type', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">Select type...</option>
                <option value="screening_reminder">Screening Reminder</option>
                <option value="genetic_counseling">Genetic Counseling</option>
                <option value="follow_up_call">Follow-up Call</option>
                <option value="lab_order">Lab Order</option>
                <option value="appointment_booking">Appointment Booking</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={action.details?.priority || 'medium'}
                onChange={(e) => updateActionDetails(index, 'priority', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Task Description</label>
              <textarea
                value={action.details?.description || ''}
                onChange={(e) => updateActionDetails(index, 'description', e.target.value)}
                placeholder="Describe the task to be created..."
                rows={2}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>
        );

      case 'send_notification':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notification Type</label>
              <select
                value={action.details?.notification_type || ''}
                onChange={(e) => updateActionDetails(index, 'notification_type', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">Select type...</option>
                <option value="sms">SMS</option>
                <option value="email">Email</option>
                <option value="push">Push Notification</option>
                <option value="in_app">In-App Message</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Recipient</label>
              <select
                value={action.details?.recipient || 'patient'}
                onChange={(e) => updateActionDetails(index, 'recipient', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="patient">Patient</option>
                <option value="provider">Provider</option>
                <option value="care_team">Care Team</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Message Template</label>
              <textarea
                value={action.details?.message || ''}
                onChange={(e) => updateActionDetails(index, 'message', e.target.value)}
                placeholder="Enter the notification message..."
                rows={2}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>
        );

      case 'schedule_appointment':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Type</label>
              <select
                value={action.details?.appointment_type || ''}
                onChange={(e) => updateActionDetails(index, 'appointment_type', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">Select type...</option>
                <option value="genetic_counseling">Genetic Counseling</option>
                <option value="screening">Screening</option>
                <option value="follow_up">Follow-up</option>
                <option value="consultation">Consultation</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Frame</label>
              <select
                value={action.details?.timeframe || ''}
                onChange={(e) => updateActionDetails(index, 'timeframe', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">Select timeframe...</option>
                <option value="1_week">Within 1 week</option>
                <option value="2_weeks">Within 2 weeks</option>
                <option value="1_month">Within 1 month</option>
                <option value="3_months">Within 3 months</option>
              </select>
            </div>
          </div>
        );

      default:
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Configuration</label>
            <textarea
              value={JSON.stringify(action.details || {}, null, 2)}
              onChange={(e) => {
                try {
                  const details = JSON.parse(e.target.value);
                  updateActionDetails(index, 'details', details);
                } catch {
                  // Invalid JSON, ignore
                }
              }}
              placeholder="Enter action configuration as JSON..."
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-mono text-sm"
            />
          </div>
        );
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-orange-100 to-orange-200 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Outcome Actions</h3>
        <p className="text-gray-600 text-lg">Define what happens based on conversation outcomes.</p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-xl">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Outcome Actions</h4>
          
          {formData.outcome_actions.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-orange-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <p className="text-orange-500 mb-4">No outcome actions defined yet</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={addOutcomeAction}
                  className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Add First Action
                </button>
                <button
                  onClick={() => onFormChange('outcomes_completed', true)}
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Skip for Now
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {formData.outcome_actions.map((action, index) => (
                <div key={index} className="bg-white p-6 rounded-lg border-2 border-orange-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                      <select
                        value={action.condition}
                        onChange={(e) => updateOutcomeAction(index, 'condition', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      >
                        {conditionOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Action Type</label>
                      <select
                        value={action.action_type}
                        onChange={(e) => updateOutcomeAction(index, 'action_type', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      >
                        {actionTypeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-end">
                      <button
                        onClick={() => removeOutcomeAction(index)}
                        className="w-full bg-red-100 text-red-700 px-3 py-2 rounded-md hover:bg-red-200 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Action-specific configuration */}
                  <div className="border-t border-gray-200 pt-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-3">Action Configuration</h5>
                    {renderActionConfiguration(action, index)}
                  </div>
                </div>
              ))}
              
              <button
                onClick={addOutcomeAction}
                className={buttonStyles.secondary}
              >
                Add Another Action
              </button>
            </div>
          )}
        </div>

        {/* Manual Completion Option */}
        {formData.outcome_actions.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <h5 className="font-semibold text-yellow-800 mb-2">⚠️ No Outcome Actions Configured</h5>
            <p className="text-yellow-700 mb-4">
              You haven't configured any outcome actions yet. While recommended for full functionality, you can proceed without them and add actions later.
            </p>
            <button
              onClick={() => {
                // Mark as manually completed even without actions
                onFormChange('outcome_actions', [{
                  condition: 'meets_criteria',
                  action_type: 'create_task',
                  details: { description: 'Follow up on conversation' },
                  sequence: 1
                }]);
              }}
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors mr-3"
            >
              Add Default Action
            </button>
            <button
              onClick={() => {
                // Skip for now - add a placeholder
                onFormChange('outcome_actions', [{
                  condition: 'incomplete_data',
                  action_type: 'create_task',
                  details: { description: 'Manually skipped - configure later' },
                  sequence: 1
                }]);
              }}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Skip Outcome Actions for Now
            </button>
          </div>
        )}

        {/* Examples and Guidance */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h5 className="font-semibold text-blue-800 mb-2">🎯 Example Outcome Actions:</h5>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>Meets Criteria</strong> → Schedule genetic counseling appointment</li>
            <li>• <strong>Meets Criteria</strong> → Send appointment booking notification</li>
            <li>• <strong>Does Not Meet Criteria</strong> → Log interaction and set follow-up reminder</li>
            <li>• <strong>Incomplete Data</strong> → Generate data collection task</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
