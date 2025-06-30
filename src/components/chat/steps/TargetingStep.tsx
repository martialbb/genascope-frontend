// Targeting Step Component - handles targeting rules configuration

import React from 'react';
import type { StrategyFormData, TargetingRule } from '../../../types/chatConfiguration';
import { buttonStyles } from '../../../constants/buttonStyles';

interface TargetingStepProps {
  formData: StrategyFormData;
  onFormChange: (field: keyof StrategyFormData, value: any) => void;
}

export const TargetingStep: React.FC<TargetingStepProps> = ({
  formData,
  onFormChange
}) => {
  const fieldOptions = [
    { value: 'age', label: 'Age' },
    { value: 'gender', label: 'Gender' },
    { value: 'diagnosis', label: 'Primary Diagnosis' },
    { value: 'family_history', label: 'Family History' },
    { value: 'genetics_status', label: 'Genetic Testing Status' },
    { value: 'insurance_type', label: 'Insurance Type' },
    { value: 'risk_level', label: 'Risk Assessment Level' },
    { value: 'previous_screening', label: 'Previous Screening' }
  ];

  const operatorOptions = [
    { value: 'is', label: 'Equals' },
    { value: 'is_not', label: 'Does not equal' },
    { value: 'contains', label: 'Contains' },
    { value: 'does_not_contain', label: 'Does not contain' },
    { value: 'greater_than', label: 'Greater than' },
    { value: 'less_than', label: 'Less than' },
    { value: 'is_between', label: 'Is between' },
    { value: 'in_list', label: 'In list' },
    { value: 'not_in_list', label: 'Not in list' }
  ];

  const addTargetingRule = () => {
    const newRule: TargetingRule = {
      field: 'age',
      operator: 'greater_than',
      value: '',
      sequence: formData.targeting_rules.length + 1
    };
    onFormChange('targeting_rules', [...formData.targeting_rules, newRule]);
  };

  const updateTargetingRule = (index: number, field: keyof TargetingRule, value: any) => {
    const updatedRules = formData.targeting_rules.map((rule, i) =>
      i === index ? { ...rule, [field]: value } : rule
    );
    onFormChange('targeting_rules', updatedRules);
  };

  const removeTargetingRule = (index: number) => {
    const updatedRules = formData.targeting_rules.filter((_, i) => i !== index);
    onFormChange('targeting_rules', updatedRules);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-100 to-purple-200 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Patient Targeting</h3>
        <p className="text-gray-600 text-lg">Define which patients this strategy should engage with.</p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Targeting Rules</h4>
          
          {formData.targeting_rules.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-purple-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-purple-500 mb-4">No targeting rules defined yet</p>
              <button
                onClick={addTargetingRule}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors mr-3"
              >
                Add First Rule
              </button>
              <button
                onClick={() => {
                  // Add a default "all patients" rule to allow proceeding
                  onFormChange('targeting_rules', [{
                    field: 'all_patients',
                    operator: 'is',
                    value: 'true',
                    sequence: 0
                  }]);
                }}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Target All Patients
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {formData.targeting_rules.map((rule, index) => (
                <div key={index} className="bg-white p-4 rounded-lg border-2 border-purple-200">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Field</label>
                      <select
                        value={rule.field}
                        onChange={(e) => updateTargetingRule(index, 'field', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        {fieldOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Operator</label>
                      <select
                        value={rule.operator}
                        onChange={(e) => updateTargetingRule(index, 'operator', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        {operatorOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                      <input
                        type="text"
                        value={rule.value as string}
                        onChange={(e) => updateTargetingRule(index, 'value', e.target.value)}
                        placeholder="Enter value..."
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>

                    <div className="flex items-end">
                      <button
                        onClick={() => removeTargetingRule(index)}
                        className="w-full bg-red-100 text-red-700 px-3 py-2 rounded-md hover:bg-red-200 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                onClick={addTargetingRule}
                className={buttonStyles.secondary}
              >
                Add Another Rule
              </button>
            </div>
          )}
        </div>

        {/* Examples and Guidance */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h5 className="font-semibold text-blue-800 mb-2">📋 Example Targeting Rules:</h5>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>Age greater than 40</strong> - Target patients over 40 for cancer screening</li>
            <li>• <strong>Family history contains "breast cancer"</strong> - Engage patients with family history</li>
            <li>• <strong>Risk level equals "high"</strong> - Focus on high-risk patients</li>
            <li>• <strong>Previous screening equals "never"</strong> - Identify patients needing first screening</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
