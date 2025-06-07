/**
 * API Client for Genascope Backend
 * 
 * This service handles all communication with the backend API.
 */
import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { getApiBaseUrl } from './apiConfig';
import { checkApiHealth } from '../utils/apiHealth';
import type { Patient, PatientCreate, PatientUpdate, PatientCSVImportResponse, PatientInviteRequest, PatientInviteResponse, BulkInviteRequest, BulkInviteResponse, Invite, InviteListParams, InviteListResponse, ResendInviteRequest, ResendInviteResponse, Clinician, InviteStatus } from '../types/patients';

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
    // Use centralized API configuration that handles client/server and Docker environments
    const baseURL = getApiBaseUrl();
    
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
  
  async verifyInvite(token: string) {
    const response = await this.client.post('/api/verify_invite', { token });
    return response.data;
  }
  
  async registerPatient(registrationData: any) {
    const response = await this.client.post('/api/register_patient', registrationData);
    return response.data;
  }

  // Chat session methods
  async createChatSession(): Promise<ChatSessionData> {
    const response = await this.client.post('/api/chat/session');
    return response.data;
  }

  async startChat(sessionId: string): Promise<ChatResponse> {
    const response = await this.client.post(`/api/chat/start`, { session_id: sessionId });
    return response.data;
  }

  async submitAnswer(answerData: ChatAnswerData): Promise<ChatResponse> {
    const response = await this.client.post('/api/chat/answer', answerData);
    return response.data;
  }

  async analyzeEligibility(sessionId: string): Promise<EligibilityResult> {
    const response = await this.client.post('/api/chat/analyze', { session_id: sessionId });
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
    console.log('API Debug: Updating user with ID:', id);
    console.log('API Debug: Update data:', JSON.stringify(data, null, 2));
    
    try {
      const response = await this.client.put(`/api/users/${id}`, data);
      console.log('API Debug: Update response:', JSON.stringify(response.data, null, 2));
      
      // Validate that we got back the updated values
      const responseData = response.data;
      if (data.name && responseData.name !== data.name) {
        console.warn(`API Debug: Name mismatch - sent '${data.name}' but received '${responseData.name}'`);
      }
      if (data.role && responseData.role !== data.role) {
        console.warn(`API Debug: Role mismatch - sent '${data.role}' but received '${responseData.role}'`);
      }
      
      return responseData;
    } catch (error: any) {
      console.error('API Debug: Error updating user:', error.response?.status, error.response?.data);
      throw error;
    }
  }

  async deleteUser(id: string) {
    const response = await this.client.delete(`/api/users/${id}`);
    return response.data;
  }

  // Patient management methods
  async getPatients(params: Record<string, any> = {}): Promise<Patient[]> {
    const response = await this.client.get('/api/patients/', { params });
    return response.data;
  }

  async getPatientById(id: string): Promise<Patient> {
    const response = await this.client.get(`/api/patients/${id}`);
    return response.data;
  }

  async createPatient(data: PatientCreate): Promise<Patient> {
    const response = await this.client.post('/api/patients/', data);
    return response.data;
  }

  async updatePatient(id: string, data: PatientUpdate): Promise<Patient> {
    const response = await this.client.put(`/api/patients/${id}`, data);
    return response.data;
  }

  async deletePatient(id: string): Promise<void> {
    await this.client.delete(`/api/patients/${id}`);
  }

  async getClinicians(): Promise<Clinician[]> {
    const response = await this.client.get('/api/clinicians');
    return response.data;
  }

  async importPatientsCsv(formData: FormData): Promise<PatientCSVImportResponse> {
    const response = await this.client.post('/api/patients/import-csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async sendPatientInvite(inviteData: PatientInviteRequest): Promise<PatientInviteResponse> {
    const response = await this.client.post('/api/generate_invite', inviteData);
    return response.data;
  }

  async sendBulkInvites(bulkInviteData: BulkInviteRequest): Promise<BulkInviteResponse> {
    const response = await this.client.post('/api/bulk_invite', bulkInviteData);
    return response.data;
  }

  // Transform backend invite response to frontend interface
  private transformInviteData(backendInvite: any): Invite {
    return {
      id: backendInvite.invite_id,
      patient_id: backendInvite.email, // Use email as patient_id for now
      patient_name: `${(backendInvite.first_name || '').trim()} ${(backendInvite.last_name || '').trim()}`.trim(),
      patient_email: backendInvite.email,
      provider_id: backendInvite.provider_id,
      provider_name: backendInvite.provider_name,
      status: backendInvite.status as InviteStatus,
      invite_url: backendInvite.invite_url,
      expires_at: backendInvite.expires_at,
      created_at: backendInvite.created_at,
      updated_at: backendInvite.updated_at || backendInvite.created_at, // Fallback to created_at
      custom_message: backendInvite.custom_message,
      email_sent: true // Assume email is sent if invite exists
    };
  }

  // Invite management methods
  async getInvites(params: InviteListParams = {}): Promise<InviteListResponse> {
    const response = await this.client.get('/api/invites', { params });
    const backendData = response.data;
    
    // Transform the invite data to match frontend interface
    const transformedInvites = backendData.invites.map((invite: any) => this.transformInviteData(invite));
    
    return {
      invites: transformedInvites,
      total: backendData.total_count || backendData.total,
      page: backendData.page,
      limit: backendData.limit,
      total_pages: backendData.total_pages
    };
  }

  async getInviteById(id: string): Promise<Invite> {
    const response = await this.client.get(`/api/invites/${id}`);
    return this.transformInviteData(response.data);
  }

  async cancelInvite(id: string): Promise<void> {
    await this.client.delete(`/api/invites/${id}`);
  }

  async resendInvite(id: string, data: ResendInviteRequest): Promise<ResendInviteResponse> {
    const response = await this.client.post(`/api/invites/${id}/resend`, data);
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

