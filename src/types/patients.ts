/**
 * TypeScript definitions for patient-related data structures
 * These types mirror the Pydantic schemas defined in the backend
 */

export enum PatientStatus {
  ACTIVE = "active",
  INACTIVE = "inactive", 
  ARCHIVED = "archived",
  PENDING = "pending"
}

export interface Patient {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  status: PatientStatus;
  external_id?: string;
  clinician_id?: string;
  account_id?: string;
  clinician_name?: string;
  date_of_birth?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  has_pending_invite: boolean;
}

export interface PatientCreate {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  status?: PatientStatus;
  external_id?: string;
  clinician_id?: string;
  date_of_birth?: string;
  notes?: string;
}

export interface PatientUpdate {
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  status?: PatientStatus;
  clinician_id?: string;
  date_of_birth?: string;
  notes?: string;
}

export interface PatientInviteRequest {
  patient_id: string;
  provider_id: string;
  send_email?: boolean;
  custom_message?: string;
  expiry_days?: number;
}

export interface PatientInviteResponse {
  id: string;
  invite_url: string;
  expires_at: string;
  created_at: string;
  provider_id: string;
  patient_id: string;
}

export interface BulkPatientInviteRequest {
  patient_id: string;
  provider_id: string;
  custom_message?: string;
  expiry_days?: number;
}

export interface BulkInviteRequest {
  patients: BulkPatientInviteRequest[];
  send_emails: boolean;
  custom_message?: string;
}

export interface BulkInviteResponse {
  successful: PatientInviteResponse[];
  failed: Array<{
    data: Record<string, any>;
    error: string;
  }>;
  total_sent: number;
  total_failed: number;
}

export interface PatientCSVImportResponse {
  successful_count: number;
  failed_count: number;
  errors: Array<{
    row: number;
    message: string;
    data?: Record<string, any>;
  }>;
  sample_patients: Patient[];
}

export interface Clinician {
  id: string;
  name: string;
  email: string;
  role: string;
}

// Invite Management Types
export enum InviteStatus {
  PENDING = "pending",
  COMPLETED = "completed", 
  EXPIRED = "expired",
  CANCELLED = "cancelled"
}

export interface Invite {
  id: string;
  patient_id: string;
  provider_id: string;
  status: InviteStatus;
  invite_url: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
  custom_message?: string;
  email_sent: boolean;
  // Patient details for easier display
  patient_name: string;
  patient_email: string;
  // Provider details
  provider_name: string;
}

export interface InviteListParams {
  status?: InviteStatus;
  patient_id?: string;
  provider_id?: string;
  created_after?: string;
  created_before?: string;
  page?: number;
  limit?: number;
}

export interface InviteListResponse {
  invites: Invite[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface ResendInviteRequest {
  custom_message?: string;
  expiry_days?: number;
}

export interface ResendInviteResponse {
  id: string;
  invite_url: string;
  expires_at: string;
  updated_at: string;
}
