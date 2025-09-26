/**
 * API Client for Genascope Backend
 * 
 * This service handles all communication with the backend API.
 */
import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { API_CONFIG } from './apiConfig';
import { checkApiHealth } from '../utils/apiHealth';
import type { Patient, PatientCreate, PatientUpdate, PatientCSVImportResponse, PatientInviteRequest, PatientInviteResponse, BulkInviteRequest, BulkInviteResponse, Invite, InviteListParams, InviteListResponse, ResendInviteRequest, ResendInviteResponse, Clinician, InviteStatus, ChatStrategy } from '../types/patients';

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

// Availability management types
export interface AvailabilitySlot {
  time: string;
  available: boolean;
}

export interface SetAvailabilityRequest {
  date: string;
  time_slots: string[];
  recurring?: boolean;
}

export interface AvailabilitySetResponse {
  message: string;
  date: string;
  time_slots: string[];
}

class ApiService {
  private client: AxiosInstance;
  
  constructor() {
    // Use centralized API configuration that handles client/server and Docker environments
    const baseURL = API_CONFIG.baseUrl;
    
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Add auth interceptor with debug logging and cache busting
    this.client.interceptors.request.use((config) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      console.log('API Debug: Request to', config.url);
      console.log('API Debug: Auth token present?', !!token);

      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
        console.log('API Debug: Added Authorization header');
      } else {
        console.warn('API Debug: No auth token available for request to', config.url);
      }

      // Add cache busting parameter to bypass Cloudflare cache
      config.params = config.params || {};
      config.params._cb = Date.now();
      config.params._v = '2.1'; // Force cache invalidation after pagination fix
      
      // Add cache control headers to prevent caching
      config.headers = config.headers || {};
      config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
      config.headers['Pragma'] = 'no-cache';
      
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
    const response = await this.client.get(`/appointments/clinician/${clinicianId}?start_date=${startDate}&end_date=${endDate}`);
    return response.data;
  }

  async getOrganizationAppointments(params?: Record<string, any>) {
    const response = await this.client.get('/organization/appointments', { params });
    return response.data;
  }

  // Get availability for a clinician on a specific date
  async getAvailability(clinicianId: string, date: string): Promise<AvailabilityResponse> {
    const response = await this.client.get(`/availability?clinician_id=${clinicianId}&date=${date}`);
    return response.data;
  }

  // Book a new appointment
  async bookAppointment(appointmentData: AppointmentRequest): Promise<AppointmentResponse> {
    const response = await this.client.post('/book_appointment', appointmentData);
    return response.data;
  }

  // Get appointments for a specific patient
  async getPatientAppointments(patientId: string) {
    const response = await this.client.get(`/appointments/patient/${patientId}`);
    return response.data;
  }

  // Update appointment status
  async updateAppointmentStatus(appointmentId: string, status: string) {
    const response = await this.client.put(`/appointments/${appointmentId}?status=${status}`);
    return response.data;
  }

  // Set clinician availability
  async setClinicianAvailability(clinicianId: string, availabilityData: any) {
    const response = await this.client.post(`/availability/set?clinician_id=${clinicianId}`, availabilityData);
    return response.data;
  }

  async generateInvite(patientData: any) {
    const response = await this.client.post('/generate_invite', patientData);
    return response.data;
  }
  
  async verifyInvite(token: string) {
    const response = await this.client.post('/verify_invite', { token });
    return response.data;
  }
  
  async registerPatient(registrationData: any) {
    const response = await this.client.post('/register_patient', registrationData);
    return response.data;
  }

  async simplifiedAccess(accessData: {
    invite_token: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    agree_to_terms: boolean;
    agree_to_privacy: boolean;
  }) {
    const response = await this.client.post('/simplified_access', accessData);
    return response.data;
  }

  // Chat session methods
  async createChatSession(): Promise<ChatSessionData> {
    const response = await this.client.post('/chat/session');
    return response.data;
  }

  async startChat(sessionId: string): Promise<ChatResponse> {
    const response = await this.client.post(`/chat/start`, { session_id: sessionId });
    return response.data;
  }

  async submitAnswer(answerData: ChatAnswerData): Promise<ChatResponse> {
    const response = await this.client.post('/chat/answer', answerData);
    return response.data;
  }

  async analyzeEligibility(sessionId: string): Promise<EligibilityResult> {
    const response = await this.client.post('/chat/analyze', { session_id: sessionId });
    return response.data;
  }

  // AI Chat session methods (new AI endpoints)
  async startAIChatSession(sessionData: {
    strategy_id: string;
    patient_id: string;
    session_type?: 'screening' | 'assessment' | 'follow_up' | 'consultation';
    initial_context?: any;
  }) {
    const response = await this.client.post('/ai-chat/sessions', sessionData);
    return response.data;
  }

  async sendAIMessage(sessionId: string, messageData: {
    message: string;
    message_metadata?: any;
  }) {
    const response = await this.client.post(`/ai-chat/sessions/${sessionId}/messages`, messageData);
    return response.data;
  }

  async getAISessionMessages(sessionId: string, limit?: number) {
    const params = limit ? `?limit=${limit}` : '';
    const response = await this.client.get(`/ai-chat/sessions/${sessionId}/messages${params}`);
    return response.data;
  }

  async getAIChatSession(sessionId: string) {
    const response = await this.client.get(`/ai-chat/sessions/${sessionId}`);
    return response.data;
  }

  async endAIChatSession(sessionId: string, reason: string = 'user_ended') {
    const response = await this.client.post(`/ai-chat/sessions/${sessionId}/end?reason=${reason}`);
    return response.data;
  }

  async getAIChatSessions(patientId?: string, sessionStatus?: string, limit: number = 10) {
    const params = new URLSearchParams();
    if (patientId) params.append('patient_id', patientId);
    if (sessionStatus) params.append('session_status', sessionStatus);
    params.append('limit', limit.toString());
    
    const response = await this.client.get(`/ai-chat/sessions?${params.toString()}`);
    return response.data;
  }

  // Lab test ordering
  async orderTest(orderData: {
    provider_id: string;
    patient_id: string;
    test_type: string;
    shipping_address: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      zip_code: string;
    };
  }) {
    const response = await this.client.post('/lab-tests/order', orderData);
    return response.data;
  }

  // Account management methods
  async getAccounts() {
    const response = await this.client.get('/accounts/');
    return response.data;
  }

  async getAccountById(id: string) {
    const response = await this.client.get(`/accounts/${id}`);
    return response.data;
  }

  async createAccount(data: any) {
    const response = await this.client.post('/accounts', data);
    return response.data;
  }

  async updateAccount(id: string, data: any) {
    const response = await this.client.put(`/accounts/${id}`, data);
    return response.data;
  }

  async deleteAccount(id: string) {
    const response = await this.client.delete(`/accounts/${id}`);
    return response.data;
  }

  // User management methods
  async getUsers(params?: any) {
    const response = await this.client.get('/users', { params });
    return response.data;
  }

  async getUsersByAccount(accountId: string) {
    const response = await this.client.get(`/users?account_id=${accountId}`);
    return response.data;
  }

  async getUserById(id: string) {
    const response = await this.client.get(`/users/${id}`);
    return response.data;
  }

  async createUser(userData: any) {
    const response = await this.client.post('/users', userData);
    return response.data;
  }

  async updateUser(id: string, data: any) {
    console.log('API Debug: Updating user with ID:', id);
    console.log('API Debug: Update data:', JSON.stringify(data, null, 2));
    
    try {
      const response = await this.client.put(`/users/${id}`, data);
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
    const response = await this.client.delete(`/users/${id}`);
    return response.data;
  }

  // Patient management methods
  async getPatients(params: Record<string, any> = {}): Promise<Patient[]> {
    const response = await this.client.get('/patients/', { params });
    return response.data;
  }

  async getPatientById(id: string): Promise<Patient> {
    const response = await this.client.get(`/patients/${id}`);
    return response.data;
  }

  async createPatient(data: PatientCreate): Promise<Patient> {
    const response = await this.client.post('/patients/', data);
    return response.data;
  }

  async updatePatient(id: string, data: PatientUpdate): Promise<Patient> {
    const response = await this.client.put(`/patients/${id}`, data);
    return response.data;
  }

  async deletePatient(id: string): Promise<void> {
    await this.client.delete(`/patients/${id}`);
  }

  async getClinicians(): Promise<Clinician[]> {
    const response = await this.client.get('/clinicians');
    return response.data;
  }

  async importPatientsCsv(formData: FormData): Promise<PatientCSVImportResponse> {
    const response = await this.client.post('/patients/import-csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async sendPatientInvite(inviteData: PatientInviteRequest): Promise<PatientInviteResponse> {
    const response = await this.client.post('/generate_invite', inviteData);
    return response.data;
  }

  async sendBulkInvites(bulkInviteData: BulkInviteRequest): Promise<BulkInviteResponse> {
    const response = await this.client.post('/bulk_invite', bulkInviteData);
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
    const response = await this.client.get('/invites', { params });
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

  // Get invite statistics by fetching all invites and calculating locally for better performance
  async getInviteStatistics(): Promise<{
    pending: number;
    completed: number;
    expired: number;
    cancelled: number;
    total: number;
  }> {
    try {
      console.log('📊 Fetching all invites for local statistics calculation...');
      
      // Fetch all invites using pagination (backend limits to max 100 per request)
      const allInvites: any[] = [];
      let page = 1;
      let hasMore = true;
      
      while (hasMore) {
        const response = await this.getInvites({ limit: 100, page });
        allInvites.push(...response.invites);
        
        console.log(`📊 Fetched page ${page}: ${response.invites.length} invites (total so far: ${allInvites.length})`);
        
        // Check if we have more pages
        hasMore = response.invites.length === 100 && page < (response.total_pages || 999);
        page++;
        
        // Safety check to prevent infinite loops
        if (page > 100) {
          console.warn('📊 Reached maximum page limit (100), stopping pagination');
          break;
        }
      }
      
      console.log(`📊 Processing ${allInvites.length} invites for statistics...`);
      
      // Calculate statistics by filtering locally
      const stats = {
        pending: allInvites.filter(invite => invite.status === 'pending').length,
        completed: allInvites.filter(invite => invite.status === 'completed').length,
        expired: allInvites.filter(invite => invite.status === 'expired').length,
        cancelled: allInvites.filter(invite => invite.status === 'cancelled').length,
        total: allInvites.length
      };

      console.log('📊 Calculated invite statistics:', stats);
      return stats;
    } catch (error: any) {
      console.error('📊 Error fetching invites for statistics:', error);
      
      // If pagination fails, fallback to the old method of multiple calls
      console.warn('Falling back to multiple API calls for statistics');
      const [pendingRes, completedRes, expiredRes, cancelledRes] = await Promise.all([
        this.getInvites({ status: 'pending' as InviteStatus, limit: 1 }),
        this.getInvites({ status: 'completed' as InviteStatus, limit: 1 }),
        this.getInvites({ status: 'expired' as InviteStatus, limit: 1 }),
        this.getInvites({ status: 'cancelled' as InviteStatus, limit: 1 })
      ]);

      const stats = {
        pending: pendingRes.total,
        completed: completedRes.total,
        expired: expiredRes.total,
        cancelled: cancelledRes.total,
        total: pendingRes.total + completedRes.total + expiredRes.total + cancelledRes.total
      };

      return stats;
    }
  }

  async getInviteById(id: string): Promise<Invite> {
    const response = await this.client.get(`/invites/${id}`);
    return this.transformInviteData(response.data);
  }

  async cancelInvite(id: string): Promise<void> {
    await this.client.delete(`/invites/${id}`);
  }

  async resendInvite(id: string, data: ResendInviteRequest): Promise<ResendInviteResponse> {
    const response = await this.client.post(`/invites/${id}/resend`, data);
    return response.data;
  }

  async getPatientInvites(patientId: string, status?: InviteStatus): Promise<PatientInviteResponse[]> {
    const params = status ? { status } : {};
    const response = await this.client.get(`/patients/${patientId}/invites`, { params });
    return response.data;
  }

  // Authentication verification
  async verifyAuth() {
    try {
      console.log('API Debug: Verifying authentication status');
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

      if (!token) {
        console.warn('API Debug: No auth token found in storage');
        return { authenticated: false, error: 'No token found' };
      }

      // Try to get current user profile to verify token works
      const response = await this.client.get('/auth/me');
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

  // Chat Strategies
  async getChatStrategies(params: { active_only?: boolean } = {}): Promise<ChatStrategy[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params.active_only !== undefined) {
        queryParams.append('active_only', params.active_only.toString());
      }
      
      const url = `/v1/chat-configuration/strategies${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await this.client.get(url);
      
      // Handle both array response and paginated response
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return response.data.strategies || response.data.items || [];
    } catch (error) {
      console.error('Failed to fetch chat strategies:', error);
      
      // Return mock strategies for development
      return [
        { id: 'strategy-1', name: 'Genetic Counseling Assessment', specialty: 'Oncology', is_active: true },
        { id: 'strategy-2', name: 'Breast Cancer Screening', specialty: 'Oncology', is_active: true },
        { id: 'strategy-3', name: 'Cardiac Risk Assessment', specialty: 'Cardiology', is_active: true }
      ];
    }
  }
}

export const apiService = new ApiService();
export default apiService;

