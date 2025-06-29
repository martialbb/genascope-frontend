// Strategy Card Component for displaying individual strategies

import React from 'react';
import type { ChatStrategy } from '../../types/chatConfiguration';
import { buttonStyles } from '../../constants/buttonStyles';

interface StrategyCardProps {
  strategy: ChatStrategy;
  onEdit: (strategy: ChatStrategy) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, currentStatus: boolean) => void;
}

export const StrategyCard: React.FC<StrategyCardProps> = ({
  strategy,
  onEdit,
  onDelete,
  onToggle
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{strategy.name}</h3>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{strategy.description}</p>
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span className="bg-gray-100 px-2 py-1 rounded-full">{strategy.specialty}</span>
              <span>Updated {strategy.updated_at ? new Date(strategy.updated_at).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={strategy.is_active || false}
                onChange={() => onToggle(strategy.id!, strategy.is_active || false)}
                className="sr-only"
              />
              <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                strategy.is_active ? 'bg-green-600' : 'bg-gray-300'
              }`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  strategy.is_active ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </div>
            </label>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              strategy.is_active 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              {strategy.is_active ? 'Active' : 'Draft'}
            </span>
          </div>
        </div>
        
        <div className="border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              <div>Knowledge Sources: {strategy.knowledge_sources?.length || 0}</div>
              <div>Targeting Rules: {strategy.targeting_rules?.length || 0}</div>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => onEdit(strategy)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Edit
              </button>
              <button 
                onClick={() => onDelete(strategy.id!)}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
