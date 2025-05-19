/**
 * API Client for Genascope Backend
 * 
 * This service handles all communication with the backend API.
 */
import axios, { AxiosInstance } from 'axios';

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
    
    // Add auth interceptor
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }
  
  // Chat API methods
  async startChat(sessionId: string): Promise<ChatResponse> {
    const response = await this.client.post<ChatResponse>('/api/start_chat', { sessionId });
    return response.data;
  }
  
  async submitAnswer(data: ChatAnswerData): Promise<ChatResponse> {
    const response = await this.client.post<ChatResponse>('/api/submit_answer', data);
    return response.data;
  }
  
  async getChatHistory(sessionId: string) {
    const response = await this.client.get(`/api/history/${sessionId}`);
    return response.data;
  }
  
  // Auth methods
  async login(email: string, password: string) {
    const response = await this.client.post('/api/auth/token', new URLSearchParams({
      username: email,
      password,
    }));
    
    const { access_token } = response.data;
    localStorage.setItem('token', access_token);
    return access_token;
  }
  
  // Eligibility methods
  async analyzeEligibility(sessionId: string): Promise<EligibilityResult> {
    const response = await this.client.post('/api/eligibility/analyze', { sessionId });
    return response.data;
  }
  
  // Admin methods
  async createAccount(data: any) {
    return this.client.post('/api/admin/create_account', data);
  }
  
  async createUser(data: any) {
    return this.client.post('/api/account/create_user', data);
  }
  
  // Lab methods
  async orderTest(data: any) {
    return this.client.post('/api/labs/order_test', data);
  }
  
  async getResults(orderId: string) {
    return this.client.get(`/api/labs/results/${orderId}`);
  }
  
  // Invite methods
  async generateInvite(patientData: any) {
    const response = await this.client.post('/api/generate_invite', patientData);
    return response.data;
  }
  
  // Patient methods
  async getPatients() {
    return this.client.get('/api/patients');
  }
  
  async searchPatients(query: string) {
    return this.client.get(`/api/patients/search?query=${encodeURIComponent(query)}`);
  }

  // Appointment methods
  async getAvailability(clinicianId: string, date: string): Promise<AvailabilityResponse> {
    const response = await this.client.get(`/api/availability?clinician_id=${clinicianId}&date=${date}`);
    return response.data;
  }

  async bookAppointment(appointmentData: AppointmentRequest): Promise<AppointmentResponse> {
    const response = await this.client.post('/api/book_appointment', appointmentData);
    return response.data;
  }

  async getClinicianAppointments(clinicianId: string, startDate: string, endDate: string) {
    const response = await this.client.get(
      `/api/appointments/clinician/${clinicianId}?start_date=${startDate}&end_date=${endDate}`
    );
    return response.data;
  }

  async getPatientAppointments(patientId: string) {
    const response = await this.client.get(`/api/appointments/patient/${patientId}`);
    return response.data;
  }

  async updateAppointmentStatus(appointmentId: string, status: string) {
    const response = await this.client.put(`/api/appointments/${appointmentId}?status=${status}`);
    return response.data;
  }
  
  async setClinicianAvailability(clinicianId: string, availabilityData: any) {
    const response = await this.client.post(`/api/availability/set?clinician_id=${clinicianId}`, availabilityData);
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
