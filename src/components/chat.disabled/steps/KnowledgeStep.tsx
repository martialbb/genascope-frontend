// Knowledge Step Component - handles knowledge source selection and file upload

import React, { useState, useRef } from 'react';
import type { StrategyFormData, KnowledgeSource } from '../../../types/chatConfiguration';
import { buttonStyles } from '../../../constants/buttonStyles';

interface KnowledgeStepProps {
  formData: StrategyFormData;
  onFormChange: (field: keyof StrategyFormData, value: any) => void;
  knowledgeSources: KnowledgeSource[];
  onFileUpload?: (files: FileList) => Promise<void>;
}

export const KnowledgeStep: React.FC<KnowledgeStepProps> = ({
  formData,
  onFormChange,
  knowledgeSources,
  onFileUpload
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && onFileUpload) {
      await onFileUpload(e.target.files);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && onFileUpload) {
      await onFileUpload(e.dataTransfer.files);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const removeKnowledgeSource = (sourceId: string) => {
    onFormChange('knowledge_source_ids', 
      formData.knowledge_source_ids.filter(id => id !== sourceId)
    );
  };

  const selectedSources = knowledgeSources.filter(source =>
    formData.knowledge_source_ids.includes(source.id || '')
  );

  const availableSources = knowledgeSources.filter(source =>
    !formData.knowledge_source_ids.includes(source.id || '')
  );

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-100 to-green-200 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Knowledge Sources</h3>
        <p className="text-gray-600 text-lg">Upload training materials or select from existing sources.</p>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* File Upload Section */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Upload New Documents</h4>
          
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-green-400 bg-green-50'
                : 'border-gray-300 hover:border-green-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="text-gray-600">
              <p className="text-lg font-medium">Drop files here, or <button onClick={handleFileSelect} className="text-green-600 hover:text-green-700 underline">browse</button></p>
              <p className="text-sm mt-2">Supports: PDF, DOC, DOCX, TXT, CSV, JSON (max 10MB)</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt,.csv,.json"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Upload Progress */}
          {Object.keys(uploadProgress).length > 0 && (
            <div className="mt-4 space-y-2">
              {Object.entries(uploadProgress).map(([filename, progress]) => (
                <div key={filename} className="bg-white p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">{filename}</span>
                    <span className="text-sm text-gray-500">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Knowledge Sources */}
        {selectedSources.length > 0 && (
          <div className="bg-white border border-green-200 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Selected Knowledge Sources ({selectedSources.length})</h4>
            <div className="space-y-3">
              {selectedSources.map((source) => (
                <div key={source.id} className="flex items-center justify-between bg-green-50 p-4 rounded-lg">
                  <div className="flex-1">
                    <h5 className="font-semibold text-gray-800">{source.name}</h5>
                    <p className="text-sm text-gray-600 mt-1">{source.description || 'No description'}</p>
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <span className="capitalize">{source.source_type || 'file'}</span>
                      {source.file_size && (
                        <span className="ml-2">
                          {(source.file_size / 1024 / 1024).toFixed(1)} MB
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => removeKnowledgeSource(source.id!)}
                    className="ml-4 text-red-600 hover:text-red-700 px-3 py-1 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available Knowledge Sources */}
        {availableSources.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Available Knowledge Sources</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableSources.map((source) => (
                <div key={source.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h5 className="font-semibold text-gray-800">{source.name}</h5>
                      <p className="text-sm text-gray-600 mt-1">{source.description || 'No description'}</p>
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <span className="capitalize">{source.source_type || 'file'}</span>
                        {source.file_size && (
                          <span className="ml-2">
                            {(source.file_size / 1024 / 1024).toFixed(1)} MB
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        onFormChange('knowledge_source_ids', [...formData.knowledge_source_ids, source.id!]);
                      }}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Manual Completion Option */}
        {formData.knowledge_source_ids.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <h5 className="font-semibold text-yellow-800 mb-2">⚠️ No Knowledge Sources Selected</h5>
            <p className="text-yellow-700 mb-4">
              You haven't selected any knowledge sources yet. While recommended, you can proceed without them and add sources later.
            </p>
            <button
              onClick={() => {
                // Mark step as manually completed
                onFormChange('knowledge_completed', true);
              }}
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Skip Knowledge Sources for Now
            </button>
          </div>
        )}

        {/* Guidance */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h5 className="font-semibold text-blue-800 mb-2">💡 Knowledge Source Guidelines:</h5>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Upload clinical guidelines, protocols, and reference materials</li>
            <li>• Include patient education materials and FAQ documents</li>
            <li>• Ensure all content is current and medically accurate</li>
            <li>• Consider specialty-specific guidelines for your practice area</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
