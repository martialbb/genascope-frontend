// Overview Step Component for basic strategy information

import React from 'react';
import type { StrategyFormData } from '../../../types/chatConfiguration';

interface OverviewStepProps {
  formData: StrategyFormData;
  onFormChange: (field: keyof StrategyFormData, value: any) => void;
}

export const OverviewStep: React.FC<OverviewStepProps> = ({
  formData,
  onFormChange
}) => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Strategy Overview</h3>
        <p className="text-gray-600 text-lg">Define the basic information for your chat strategy.</p>
      </div>
      
      <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl">
          <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center">
            <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a.997.997 0 01-1.414 0l-7-7A2 2 0 013 12V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Strategy Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => onFormChange('name', e.target.value)}
            className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            placeholder="e.g., Breast Cancer Screening Protocol"
          />
        </div>
        
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl">
          <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center">
            <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => onFormChange('description', e.target.value)}
            rows={4}
            className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            placeholder="Describe the purpose and scope of this strategy..."
          />
        </div>
        
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl">
          <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center">
            <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Primary Goal
          </label>
          <textarea
            value={formData.goal}
            onChange={(e) => onFormChange('goal', e.target.value)}
            rows={3}
            className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            placeholder="What should this strategy accomplish?"
          />
        </div>
        
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl">
          <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center">
            <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
            Patient Introduction
          </label>
          <textarea
            value={formData.patient_introduction}
            onChange={(e) => onFormChange('patient_introduction', e.target.value)}
            rows={4}
            className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            placeholder="How should the AI introduce itself to patients?"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl">
            <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              Specialty
            </label>
            <select
              value={formData.specialty}
              onChange={(e) => onFormChange('specialty', e.target.value)}
              className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            >
              <option value="Oncology">Oncology</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Gastroenterology">Gastroenterology</option>
              <option value="Hepatology">Hepatology</option>
              <option value="Pharmacy">Pharmacy</option>
              <option value="Genetics">Genetics</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl">
            <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Activation
            </label>
            <div className="flex items-center bg-white p-4 rounded-lg border-2 border-green-200">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => onFormChange('is_active', e.target.checked)}
                className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-3 block text-sm font-medium text-gray-900">
                Activate strategy immediately after creation
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
