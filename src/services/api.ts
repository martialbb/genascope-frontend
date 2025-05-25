/**
 * API Client for Genascope Backend
 * 
 * This service handles all communication with the backend API.
 */
import axios from 'axios';
import type { AxiosInstance } from 'axios';

// Types that match FastAPI Pydantic models
export interface ChatQuestion {
  id: number;
  text: string;
}

export interface ChatResponse {
  question?: ChatQuestion;
  nextQuestion?: ChatQuestion;
}

export interface ChatSessionData {
  sessionId: string;
}

export interface ChatAnswerData {
  sessionId: string;
  questionId: number;
  answer: string;
}

export interface EligibilityResult {
  is_eligible: boolean;
  nccn_eligible: boolean;
  tyrer_cuzick_score: number;
  tyrer_cuzick_threshold: number;
}

// Appointment Scheduling Types
export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface AvailabilityResponse {
  date: string;
  clinician_id: string;
  clinician_name: string;
  time_slots: TimeSlot[];
}

export interface AppointmentRequest {
  clinician_id: string;
  date: string;
  time: string;
  patient_id: string;
  appointment_type: string;
  notes?: string;
}

export interface AppointmentResponse {
  appointment_id: string;
  clinician_id: string;
  clinician_name: string;
  patient_id: string;
  patient_name: string;
  date_time: string;
  appointment_type: string;
  status: string;
  confirmation_code: string;
}

class ApiService {
  private client: AxiosInstance;
  
  constructor() {
    const baseURL = import.meta.env.PUBLIC_API_URL || 'http://localhost:8000';
    
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Add auth interceptor with debug logging
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('authToken');
      console.log('API Debug: Request to', config.url);
      console.log('API Debug: Auth token present?', !!token);

      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
        console.log('API Debug: Added Authorization header');
      } else {
        console.warn('API Debug: No auth token available for request to', config.url);
      }
      return config;
    });

    // Add response interceptor for debugging
    this.client.interceptors.response.use(
      (response) => {
        console.log(`API Debug: Response from ${response.config.url} - Status: ${response.status}`);
        return response;
      },
      (error) => {
        console.error(`API Debug: Error in request to ${error.config?.url}:`, error.response?.status, error.response?.data);
        return Promise.reject(error);
      }
    );
  }

  async getClinicianAppointments(clinicianId: string, startDate: string, endDate: string) {
    const response = await this.client.get(`/api/appointments/clinician/${clinicianId}?start_date=${startDate}&end_date=${endDate}`);
    return response.data;
  }

  async generateInvite(patientData: any) {
    const response = await this.client.post('/api/generate_invite', patientData);
    return response.data;
  }

  // Account management methods
  async getAccounts() {
    const response = await this.client.get('/api/accounts');
    return response.data;
  }

  async getAccountById(id: string) {
    const response = await this.client.get(`/api/accounts/${id}`);
    return response.data;
  }

  async createAccount(data: any) {
    const response = await this.client.post('/api/accounts', data);
    return response.data;
  }

  async updateAccount(id: string, data: any) {
    const response = await this.client.put(`/api/accounts/${id}`, data);
    return response.data;
  }

  async deleteAccount(id: string) {
    const response = await this.client.delete(`/api/accounts/${id}`);
    return response.data;
  }

  // User management methods
  async getUsers(params?: any) {
    const response = await this.client.get('/api/users', { params });
    return response.data;
  }

  async getUsersByAccount(accountId: string) {
    const response = await this.client.get(`/api/users?account_id=${accountId}`);
    return response.data;
  }

  async getUserById(id: string) {
    const response = await this.client.get(`/api/users/${id}`);
    return response.data;
  }

  async createUser(userData: any) {
    const response = await this.client.post('/api/users', userData);
    return response.data;
  }

  async updateUser(id: string, data: any) {
    const response = await this.client.put(`/api/users/${id}`, data);
    return response.data;
  }

  async deleteUser(id: string) {
    const response = await this.client.delete(`/api/users/${id}`);
    return response.data;
  }

  // Authentication verification
  async verifyAuth() {
    try {
      console.log('API Debug: Verifying authentication status');
      const token = localStorage.getItem('authToken');

      if (!token) {
        console.warn('API Debug: No auth token found in storage');
        return { authenticated: false, error: 'No token found' };
      }

      // Try to get current user profile to verify token works
      const response = await this.client.get('/api/auth/me');
      console.log('API Debug: Auth verification successful', response.data);
      return {
        authenticated: true,
        user: response.data
      };
    } catch (error: any) {
      console.error('API Debug: Auth verification failed', error.response?.status, error.response?.data);
      return {
        authenticated: false,
        error: error.response?.data?.detail || error.message,
        status: error.response?.status
      };
    }
  }
}

export const apiService = new ApiService();
export default apiService;

