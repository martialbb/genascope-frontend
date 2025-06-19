/**
 * Chat Configuration API Service
 * 
 * This service handles all communication with the chat configuration backend API.
 */
import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { getApiBaseUrl } from './apiConfig';

// Types that match the backend Pydantic models
export interface ChatStrategy {
  id?: string;
  account_id?: string;
  name: string;
  description?: string;
  goal: string;
  is_active?: boolean;
  version?: number;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ChatStrategyCreate {
  name: string;
  description?: string;
  goal: string;
  is_active?: boolean;
}

export interface ChatStrategyUpdate {
  name?: string;
  description?: string;
  goal?: string;
  is_active?: boolean;
}

export interface KnowledgeSource {
  id?: string;
  account_id?: string;
  name: string;
  description?: string;
  source_type?: 'file' | 'url' | 'text';
  content_type?: string;
  file_size?: number;
  file_path?: string;
  s3_bucket?: string;
  s3_key?: string;
  s3_url?: string;
  metadata?: Record<string, any>;
  processing_status?: 'pending' | 'processing' | 'completed' | 'failed';
  processing_error?: string;
  processed_at?: string;
  content_summary?: string;
  is_active?: boolean;
  access_level?: 'private' | 'shared' | 'public';
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface KnowledgeSourceCreate {
  name: string;
  description?: string;
  source_type?: 'file' | 'url' | 'text';
  content_type?: string;
  metadata?: Record<string, any>;
  access_level?: 'private' | 'shared' | 'public';
}

export interface KnowledgeSourceUpdate {
  name?: string;
  description?: string;
  is_active?: boolean;
  access_level?: 'private' | 'shared' | 'public';
}

export interface FileUploadRequest {
  file: File;
  name?: string;
  description?: string;
  access_level?: 'private' | 'shared' | 'public';
}

export interface FileUploadResponse {
  id: string;
  name: string;
  file_path: string;
  processing_status: string;
  message: string;
}

export interface KnowledgeSourceSearchRequest {
  query?: string;
  category?: string[];
  tags?: string[];
  file_types?: string[];
  size_min?: number;
  size_max?: number;
  date_from?: string;
  date_to?: string;
  processing_status?: string[];
  specialty?: string[];
  access_level?: string[];
  sort_by?: 'relevance' | 'date' | 'size' | 'title' | 'last_accessed';
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface KnowledgeSourceSearchResponse {
  items: KnowledgeSource[];
  total: number;
  has_more: boolean;
  facets?: Record<string, Array<Record<string, string | number>>>;
}

export interface TargetingRule {
  id?: string;
  strategy_id?: string;
  name: string;
  condition_type: string;
  condition_config: Record<string, any>;
  is_active?: boolean;
  created_at?: string;
}

export interface OutcomeAction {
  id?: string;
  strategy_id?: string;
  name: string;
  action_type: string;
  action_config: Record<string, any>;
  trigger_condition: Record<string, any>;
  is_active?: boolean;
  created_at?: string;
}

export interface StrategyExecution {
  id?: string;
  strategy_id: string;
  user_id: string;
  session_id?: string;
  execution_context?: Record<string, any>;
  results?: Record<string, any>;
  status?: 'pending' | 'running' | 'completed' | 'failed';
  started_at?: string;
  completed_at?: string;
  created_at?: string;
}

export interface AnalyticsData {
  strategy_id: string;
  metric_name: string;
  metric_value: number;
  dimension_filters?: Record<string, any>;
  time_period: string;
  recorded_at: string;
}

class ChatConfigurationAPI {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: getApiBaseUrl(),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - redirect to login
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Chat Strategy methods
  async getStrategies(): Promise<ChatStrategy[]> {
    const response = await this.client.get('/api/v1/chat-configuration/strategies');
    return response.data;
  }

  async getStrategy(id: string): Promise<ChatStrategy> {
    const response = await this.client.get(`/api/v1/chat-configuration/strategies/${id}`);
    return response.data;
  }

  async createStrategy(strategy: ChatStrategyCreate): Promise<ChatStrategy> {
    const response = await this.client.post('/api/v1/chat-configuration/strategies', strategy);
    return response.data;
  }

  async updateStrategy(id: string, strategy: ChatStrategyUpdate): Promise<ChatStrategy> {
    const response = await this.client.put(`/api/v1/chat-configuration/strategies/${id}`, strategy);
    return response.data;
  }

  async deleteStrategy(id: string): Promise<void> {
    await this.client.delete(`/api/v1/chat-configuration/strategies/${id}`);
  }

  // Knowledge Source methods
  async getKnowledgeSources(): Promise<KnowledgeSource[]> {
    const response = await this.client.get('/api/v1/chat-configuration/knowledge-sources');
    return response.data;
  }

  async getKnowledgeSource(id: string): Promise<KnowledgeSource> {
    const response = await this.client.get(`/api/v1/chat-configuration/knowledge-sources/${id}`);
    return response.data;
  }

  async createKnowledgeSource(source: KnowledgeSourceCreate): Promise<KnowledgeSource> {
    const response = await this.client.post('/api/v1/chat-configuration/knowledge-sources', source);
    return response.data;
  }

  async updateKnowledgeSource(id: string, source: KnowledgeSourceUpdate): Promise<KnowledgeSource> {
    const response = await this.client.put(`/api/v1/chat-configuration/knowledge-sources/${id}`, source);
    return response.data;
  }

  async deleteKnowledgeSource(id: string): Promise<void> {
    await this.client.delete(`/api/v1/chat-configuration/knowledge-sources/${id}`);
  }

  // File upload methods
  async uploadFile(uploadRequest: FileUploadRequest): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', uploadRequest.file);
    
    if (uploadRequest.name) {
      formData.append('name', uploadRequest.name);
    }
    if (uploadRequest.description) {
      formData.append('description', uploadRequest.description);
    }
    if (uploadRequest.access_level) {
      formData.append('access_level', uploadRequest.access_level);
    }

    const response = await this.client.post('/api/v1/chat-configuration/knowledge-sources/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Search methods
  async searchKnowledgeSources(searchParams: KnowledgeSourceSearchRequest): Promise<KnowledgeSourceSearchResponse> {
    const response = await this.client.post('/api/v1/chat-configuration/knowledge-sources/search', searchParams);
    return response.data;
  }

  // Targeting Rules methods
  async getTargetingRules(strategyId: string): Promise<TargetingRule[]> {
    const response = await this.client.get(`/api/v1/chat-configuration/strategies/${strategyId}/targeting-rules`);
    return response.data;
  }

  async createTargetingRule(strategyId: string, rule: Omit<TargetingRule, 'id' | 'strategy_id' | 'created_at'>): Promise<TargetingRule> {
    const response = await this.client.post(`/api/v1/chat-configuration/strategies/${strategyId}/targeting-rules`, rule);
    return response.data;
  }

  async updateTargetingRule(strategyId: string, ruleId: string, rule: Partial<TargetingRule>): Promise<TargetingRule> {
    const response = await this.client.put(`/api/v1/chat-configuration/strategies/${strategyId}/targeting-rules/${ruleId}`, rule);
    return response.data;
  }

  async deleteTargetingRule(strategyId: string, ruleId: string): Promise<void> {
    await this.client.delete(`/api/v1/chat-configuration/strategies/${strategyId}/targeting-rules/${ruleId}`);
  }

  // Outcome Actions methods
  async getOutcomeActions(strategyId: string): Promise<OutcomeAction[]> {
    const response = await this.client.get(`/api/v1/chat-configuration/strategies/${strategyId}/outcome-actions`);
    return response.data;
  }

  async createOutcomeAction(strategyId: string, action: Omit<OutcomeAction, 'id' | 'strategy_id' | 'created_at'>): Promise<OutcomeAction> {
    const response = await this.client.post(`/api/v1/chat-configuration/strategies/${strategyId}/outcome-actions`, action);
    return response.data;
  }

  async updateOutcomeAction(strategyId: string, actionId: string, action: Partial<OutcomeAction>): Promise<OutcomeAction> {
    const response = await this.client.put(`/api/v1/chat-configuration/strategies/${strategyId}/outcome-actions/${actionId}`, action);
    return response.data;
  }

  async deleteOutcomeAction(strategyId: string, actionId: string): Promise<void> {
    await this.client.delete(`/api/v1/chat-configuration/strategies/${strategyId}/outcome-actions/${actionId}`);
  }

  // Analytics methods
  async getStrategyAnalytics(strategyId: string, timeRange?: string): Promise<AnalyticsData[]> {
    const params = timeRange ? { time_range: timeRange } : {};
    const response = await this.client.get(`/api/v1/chat-configuration/analytics/strategy/${strategyId}`, { params });
    return response.data;
  }

  async getSystemAnalytics(timeRange?: string): Promise<Record<string, any>> {
    const params = timeRange ? { time_range: timeRange } : {};
    const response = await this.client.get('/api/v1/chat-configuration/analytics/system', { params });
    return response.data;
  }
}

// Export singleton instance
export const chatConfigurationAPI = new ChatConfigurationAPI();
export default chatConfigurationAPI;
