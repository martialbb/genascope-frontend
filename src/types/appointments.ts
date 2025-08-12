// Enhanced Appointment Types
export interface AppointmentBase {
  id: string;
  clinician_id: string;
  patient_id: string;
  date_time: string;
  appointment_type: 'virtual' | 'in-person';
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled' | 'no-show';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AppointmentDetails extends AppointmentBase {
  clinician_name: string;
  patient_name: string;
  confirmation_code?: string;
  meeting_link?: string;
  location?: string;
  duration_minutes?: number;
  reminder_sent?: boolean;
  follow_up_required?: boolean;
}

export interface AppointmentRequest {
  clinician_id: string;
  patient_id: string;
  date: string;
  time: string;
  appointment_type: 'virtual' | 'in-person';
  notes?: string;
}

export interface AppointmentResponse {
  appointment_id: string;
  clinician_id: string;
  patient_id: string;
  clinician_name: string;
  patient_name: string;
  date_time: string;
  appointment_type: 'virtual' | 'in-person';
  status: string;
  confirmation_code: string;
  notes?: string;
}

export interface AvailabilitySlot {
  time: string;
  available: boolean;
  duration_minutes?: number;
  appointment_id?: string;
}

export interface AvailabilityRequest {
  clinician_id: string;
  date: string;
  time_slots: string[];
  is_recurring?: boolean;
  recurring_days?: DayOfWeek[];
  recurring_until?: string;
}

export interface AvailabilityResponse {
  success: boolean;
  message: string;
  availability_id?: string;
}

export interface ClinicianAvailability {
  clinician_id: string;
  date: string;
  time_slots: AvailabilitySlot[];
  is_recurring: boolean;
  recurring_days?: DayOfWeek[];
  recurring_until?: string;
}

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface AppointmentFilter {
  status?: string[];
  appointment_type?: string[];
  date_range?: {
    start: string;
    end: string;
  };
  clinician_id?: string;
  patient_id?: string;
}

export interface AppointmentStats {
  total_appointments: number;
  scheduled: number;
  completed: number;
  cancelled: number;
  no_shows: number;
  upcoming_today: number;
  upcoming_week: number;
  completion_rate: number;
}

export interface AppointmentStatusUpdate {
  appointment_id: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled' | 'no-show';
  notes?: string;
  updated_by: string;
}

export interface RescheduleRequest {
  appointment_id: string;
  new_date: string;
  new_time: string;
  reason?: string;
}

export interface AppointmentReminder {
  appointment_id: string;
  reminder_type: 'email' | 'sms' | 'push';
  scheduled_time: string;
  sent: boolean;
  sent_at?: string;
}

export interface AppointmentConflict {
  conflicting_appointment_id: string;
  proposed_time: string;
  conflict_type: 'overlap' | 'back_to_back' | 'insufficient_break';
  resolution_suggestions: string[];
}

// Enhanced appointment management interfaces
export interface BulkAppointmentOperation {
  operation: 'cancel' | 'reschedule' | 'complete' | 'send_reminder';
  appointment_ids: string[];
  parameters?: {
    new_date?: string;
    new_time?: string;
    cancellation_reason?: string;
    reminder_type?: 'email' | 'sms' | 'push';
  };
}

export interface AppointmentSearchCriteria {
  query: string;
  filters: AppointmentFilter;
  sort_by: 'date' | 'status' | 'created_at' | 'updated_at';
  sort_order: 'asc' | 'desc';
  page: number;
  limit: number;
}

export interface AppointmentAnalytics {
  period: {
    start_date: string;
    end_date: string;
  };
  metrics: {
    total_appointments: number;
    average_duration: number;
    cancellation_rate: number;
    no_show_rate: number;
    peak_hours: string[];
    popular_appointment_types: {
      type: string;
      count: number;
      percentage: number;
    }[];
  };
  trends: {
    daily_counts: { date: string; count: number }[];
    weekly_growth: number;
    monthly_growth: number;
  };
}

// Error types for appointment operations
export interface AppointmentError {
  code: string;
  message: string;
  details?: {
    field?: string;
    value?: any;
    constraint?: string;
  };
}

export interface AppointmentValidationError extends AppointmentError {
  validation_errors: {
    field: string;
    message: string;
  }[];
}

// API response wrappers
export interface AppointmentApiResponse<T> {
  success: boolean;
  data?: T;
  error?: AppointmentError;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface AppointmentListResponse extends AppointmentApiResponse<AppointmentDetails[]> {
  appointments: AppointmentDetails[];
  stats?: AppointmentStats;
}

export interface SingleAppointmentResponse extends AppointmentApiResponse<AppointmentDetails> {
  appointment: AppointmentDetails;
}

// UI-specific types
export interface AppointmentTableColumn {
  key: string;
  title: string;
  dataIndex: string;
  sorter?: boolean;
  filterable?: boolean;
  width?: number;
  render?: (value: any, record: AppointmentDetails) => React.ReactNode;
}

export interface AppointmentModalState {
  visible: boolean;
  mode: 'create' | 'edit' | 'view' | 'reschedule';
  appointment?: AppointmentDetails;
  loading: boolean;
}

export interface AppointmentFormData {
  clinician_id: string;
  patient_id: string;
  date: string;
  time: string;
  appointment_type: 'virtual' | 'in-person';
  notes?: string;
  duration_minutes?: number;
  send_reminder?: boolean;
}
