// Custom hook for chat strategy API operations

import { useState, useCallback } from 'react';
import { chatConfigurationAPI } from '../services/chatConfigurationApi';
import type { 
  ChatStrategy, 
  KnowledgeSource, 
  ChatStrategyCreate,
  StrategyFormData 
} from '../types/chatConfiguration';

export const useChatStrategy = () => {
  const [strategies, setStrategies] = useState<ChatStrategy[]>([]);
  const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStrategies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await chatConfigurationAPI.getStrategies({ skip: 0, limit: 100 });
      setStrategies(response.strategies || []);
    } catch (error) {
      console.error('Error loading strategies:', error);
      setError('Failed to load strategies');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadKnowledgeSources = useCallback(async () => {
    try {
      const knowledgeSources = await chatConfigurationAPI.getKnowledgeSources();
      setKnowledgeSources(knowledgeSources);
    } catch (error) {
      console.error('Error loading knowledge sources:', error);
    }
  }, []);

  const saveStrategy = useCallback(async (formData: StrategyFormData, editingStrategy?: ChatStrategy | null) => {
    try {
      setLoading(true);
      setError(null);
      
      const strategyData: ChatStrategyCreate = {
        name: formData.name,
        description: formData.description,
        goal: formData.goal,
        patient_introduction: formData.patient_introduction,
        specialty: formData.specialty,
        is_active: formData.is_active,
        knowledge_source_ids: formData.knowledge_source_ids.length > 0 ? formData.knowledge_source_ids : undefined,
        targeting_rules: formData.targeting_rules.length > 0 ? formData.targeting_rules.map(rule => ({
          field: rule.field,
          operator: rule.operator,
          value: rule.value,
          sequence: rule.sequence
        })) : undefined,
        outcome_actions: formData.outcome_actions.length > 0 ? formData.outcome_actions.map(action => ({
          condition: action.condition || '',
          action_type: action.action_type,
          details: action.details || {},
          sequence: action.sequence
        })) : undefined
      };

      if (editingStrategy?.id) {
        // Update existing strategy
        await chatConfigurationAPI.updateStrategy(editingStrategy.id, {
          name: strategyData.name,
          description: strategyData.description,
          goal: strategyData.goal,
          is_active: formData.is_active
        });
      } else {
        // Create new strategy
        const createdStrategy = await chatConfigurationAPI.createStrategy(strategyData);
        
        // If the user wanted the strategy to be active, update it after creation
        // This is a workaround for the backend not respecting is_active during creation
        if (formData.is_active) {
          await chatConfigurationAPI.updateStrategy(createdStrategy.id!, {
            is_active: true
          });
        }
      }
      
      await loadStrategies();
      return true;
    } catch (error) {
      console.error('Error saving strategy:', error);
      setError('Failed to save strategy');
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadStrategies]);

  const deleteStrategy = useCallback(async (id: string) => {
    try {
      await chatConfigurationAPI.deleteStrategy(id);
      await loadStrategies();
      return true;
    } catch (error) {
      console.error('Error deleting strategy:', error);
      setError('Failed to delete strategy');
      return false;
    }
  }, [loadStrategies]);

  const toggleStrategy = useCallback(async (id: string, currentStatus: boolean) => {
    try {
      await chatConfigurationAPI.updateStrategy(id, { is_active: !currentStatus });
      await loadStrategies();
      return true;
    } catch (error) {
      console.error('Error updating strategy status:', error);
      setError('Failed to update strategy status');
      return false;
    }
  }, [loadStrategies]);

  return {
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
  };
};
