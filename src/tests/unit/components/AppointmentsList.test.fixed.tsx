import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AppointmentsList from '../../../components/AppointmentsList';
import apiService from '../../../services/api';

// Mock API service
vi.mock('../../../services/api', () => {
  return {
    default: {
      getClinicianAppointments: vi.fn(),
      getPatientAppointments: vi.fn(),
      updateAppointmentStatus: vi.fn()
    }
  };
});

describe('AppointmentsList', () => {
  const mockClinicianAppointments = {
    clinician_id: 'clinician-123',
    appointments: [
      {
        appointment_id: 'appt-1',
        patient_id: 'patient-1',
        patient_name: 'John Doe',
        date_time: '2025-06-01T09:00:00Z',
        appointment_type: 'virtual',
        status: 'scheduled'
      },
      {
        appointment_id: 'appt-2',
        patient_id: 'patient-2',
        patient_name: 'Jane Smith',
        date_time: '2025-05-15T14:00:00Z',
        appointment_type: 'in-person',
        status: 'completed'
      }
    ]
  };

  const mockPatientAppointments = {
    patient_id: 'patient-123',
    appointments: [
      {
        appointment_id: 'appt-4',
        clinician_id: 'clinician-1',
        clinician_name: 'Dr. Jane Smith',
        date_time: '2025-06-05T10:00:00Z',
        appointment_type: 'virtual',
        status: 'scheduled'
      }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup mock responses
    (apiService.getClinicianAppointments as any).mockResolvedValue(mockClinicianAppointments);
    (apiService.getPatientAppointments as any).mockResolvedValue(mockPatientAppointments);
    (apiService.updateAppointmentStatus as any).mockResolvedValue({ 
      appointment_id: 'appt-1', 
      status: 'canceled'
    });
    
    // Mock dates to stabilize tests
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-05-15'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should display loading state initially', () => {
    render(<AppointmentsList clinicianId="clinician-123" isClinicianView={true} />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
  
  it('should display error message when API call fails', async () => {
    // Make the API call fail 
    (apiService.getClinicianAppointments as any).mockRejectedValue(new Error('Failed to load appointments'));
    
    render(<AppointmentsList clinicianId="clinician-123" isClinicianView={true} />);
    
    // Error message should be displayed eventually
    try {
      await waitFor(() => {
        expect(screen.getByText(/Failed to load appointments/i)).toBeInTheDocument();
      }, { timeout: 1000 });
    } catch (e) {
      // In case of timeout, test will fail but with better error message
      expect('Error message was not displayed within timeout').toBe('displayed');
    }
  });
});
