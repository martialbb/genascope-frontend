import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import apiService, { TimeSlot, AvailabilityResponse, AppointmentRequest, AppointmentResponse } from '../../../services/api';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Appointments API Integration', () => {
  const mockToken = 'mock-token';
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn().mockReturnValue(mockToken),
        setItem: vi.fn(),
        removeItem: vi.fn()
      },
      writable: true
    });
    
    // Reset axios mocks
    mockedAxios.create.mockReturnValue(mockedAxios as any);
  });
  
  describe('getAvailability', () => {
    const mockResponse = {
      data: {
        date: '2025-06-01',
        clinician_id: 'clinician-123',
        clinician_name: 'Dr. Jane Smith',
        time_slots: [
          { time: '09:00', available: true },
          { time: '09:30', available: false },
          { time: '10:00', available: true }
        ]
      }
    };
    
    it('should fetch clinician availability', async () => {
      mockedAxios.get.mockResolvedValueOnce(mockResponse);
      
      const result = await apiService.getAvailability('clinician-123', '2025-06-01');
      
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/availability?clinician_id=clinician-123&date=2025-06-01'
      );
      expect(result).toEqual(mockResponse.data);
    });
    
    it('should handle error when fetching availability', async () => {
      const errorMessage = 'Network Error';
      mockedAxios.get.mockRejectedValueOnce(new Error(errorMessage));
      
      await expect(
        apiService.getAvailability('clinician-123', '2025-06-01')
      ).rejects.toThrow(errorMessage);
    });
  });
  
  describe('bookAppointment', () => {
    const appointmentData = {
      clinician_id: 'clinician-123',
      date: '2025-06-01',
      time: '10:00',
      patient_id: 'patient-123',
      appointment_type: 'virtual',
      notes: 'Test appointment'
    };
    
    const mockResponse = {
      data: {
        appointment_id: 'appt-123',
        clinician_id: 'clinician-123',
        clinician_name: 'Dr. Jane Smith',
        patient_id: 'patient-123',
        patient_name: 'John Doe',
        date_time: '2025-06-01T10:00:00Z',
        appointment_type: 'virtual',
        status: 'scheduled',
        confirmation_code: 'ABC123'
      }
    };
    
    it('should book an appointment successfully', async () => {
      mockedAxios.post.mockResolvedValueOnce(mockResponse);
      
      const result = await apiService.bookAppointment(appointmentData);
      
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/book_appointment',
        appointmentData
      );
      expect(result).toEqual(mockResponse.data);
    });
    
    it('should handle error when booking an appointment', async () => {
      const errorMessage = 'Booking failed';
      mockedAxios.post.mockRejectedValueOnce(new Error(errorMessage));
      
      await expect(
        apiService.bookAppointment(appointmentData)
      ).rejects.toThrow(errorMessage);
    });
  });
  
  describe('getClinicianAppointments', () => {
    const mockResponse = {
      data: {
        clinician_id: 'clinician-123',
        appointments: [
          {
            appointment_id: 'appt-1',
            patient_id: 'patient-1',
            patient_name: 'John Doe',
            date_time: '2025-06-01T09:00:00Z',
            appointment_type: 'virtual',
            status: 'scheduled'
          }
        ]
      }
    };
    
    it('should fetch clinician appointments', async () => {
      mockedAxios.get.mockResolvedValueOnce(mockResponse);
      
      const result = await apiService.getClinicianAppointments(
        'clinician-123',
        '2025-06-01',
        '2025-06-30'
      );
      
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/appointments/clinician/clinician-123?start_date=2025-06-01&end_date=2025-06-30'
      );
      expect(result).toEqual(mockResponse.data);
    });
    
    it('should handle error when fetching clinician appointments', async () => {
      const errorMessage = 'Failed to fetch appointments';
      mockedAxios.get.mockRejectedValueOnce(new Error(errorMessage));
      
      await expect(
        apiService.getClinicianAppointments('clinician-123', '2025-06-01', '2025-06-30')
      ).rejects.toThrow(errorMessage);
    });
  });
  
  describe('getPatientAppointments', () => {
    const mockResponse = {
      data: {
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
      }
    };
    
    it('should fetch patient appointments', async () => {
      mockedAxios.get.mockResolvedValueOnce(mockResponse);
      
      const result = await apiService.getPatientAppointments('patient-123');
      
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/appointments/patient/patient-123'
      );
      expect(result).toEqual(mockResponse.data);
    });
    
    it('should handle error when fetching patient appointments', async () => {
      const errorMessage = 'Failed to fetch appointments';
      mockedAxios.get.mockRejectedValueOnce(new Error(errorMessage));
      
      await expect(
        apiService.getPatientAppointments('patient-123')
      ).rejects.toThrow(errorMessage);
    });
  });
  
  describe('updateAppointmentStatus', () => {
    const mockResponse = {
      data: {
        appointment_id: 'appt-123',
        status: 'canceled',
        updated_at: '2025-05-15T12:00:00Z'
      }
    };
    
    it('should update appointment status', async () => {
      mockedAxios.put.mockResolvedValueOnce(mockResponse);
      
      const result = await apiService.updateAppointmentStatus('appt-123', 'canceled');
      
      expect(mockedAxios.put).toHaveBeenCalledWith(
        '/api/appointments/appt-123?status=canceled'
      );
      expect(result).toEqual(mockResponse.data);
    });
    
    it('should handle error when updating appointment status', async () => {
      const errorMessage = 'Status update failed';
      mockedAxios.put.mockRejectedValueOnce(new Error(errorMessage));
      
      await expect(
        apiService.updateAppointmentStatus('appt-123', 'canceled')
      ).rejects.toThrow(errorMessage);
    });
  });
  
  describe('setClinicianAvailability', () => {
    const availabilityData = {
      date: '2025-06-01',
      time_slots: ['09:00', '09:30', '10:00'],
      recurring: false
    };
    
    const mockResponse = {
      data: {
        message: 'Availability set successfully',
        date: '2025-06-01',
        time_slots: ['09:00', '09:30', '10:00']
      }
    };
    
    it('should set clinician availability', async () => {
      mockedAxios.post.mockResolvedValueOnce(mockResponse);
      
      const result = await apiService.setClinicianAvailability('clinician-123', availabilityData);
      
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/availability/set?clinician_id=clinician-123',
        availabilityData
      );
      expect(result).toEqual(mockResponse.data);
    });
    
    it('should handle error when setting clinician availability', async () => {
      const errorMessage = 'Failed to set availability';
      mockedAxios.post.mockRejectedValueOnce(new Error(errorMessage));
      
      await expect(
        apiService.setClinicianAvailability('clinician-123', availabilityData)
      ).rejects.toThrow(errorMessage);
    });
  });
});
