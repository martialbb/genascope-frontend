// src/components/AppointmentsList.tsx
import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

interface AppointmentProps {
  clinicianId?: string;
  patientId?: string;
  isClinicianView?: boolean;
}

interface Appointment {
  appointment_id: string;
  patient_id?: string;
  patient_name?: string;
  clinician_id?: string;
  clinician_name?: string;
  date_time: string;
  appointment_type: string;
  status: string;
}

const AppointmentsList: React.FC<AppointmentProps> = ({ 
  clinicianId,
  patientId,
  isClinicianView = false
}) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('upcoming');
  
  // Calculate date ranges for filtering
  const today = new Date();
  const startOfToday = new Date(today);
  startOfToday.setHours(0, 0, 0, 0);
  
  const endOfToday = new Date(today);
  endOfToday.setHours(23, 59, 59, 999);
  
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  // Format dates for API
  const formatDateForApi = (date: Date) => {
    return date.toISOString().split('T')[0];
  };
  
  // Load appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        let response;
        
        if (isClinicianView && clinicianId) {
          // For clinician view, fetch appointments within a date range
          const startDate = formatDateForApi(today);
          const endDate = formatDateForApi(new Date(today.setMonth(today.getMonth() + 3)));
          response = await apiService.getClinicianAppointments(clinicianId, startDate, endDate);
          setAppointments(response.appointments || []);
        } else if (patientId) {
          // For patient view, fetch all appointments
          response = await apiService.getPatientAppointments(patientId);
          setAppointments(response.appointments || []);
        } else {
          setError('Missing required ID parameter');
        }
      } catch (err) {
        setError('Failed to load appointments. Please try again.');
        console.error('Error fetching appointments:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAppointments();
  }, [clinicianId, patientId, isClinicianView]);
  
  // Update appointment status
  const updateAppointmentStatus = async (appointmentId: string, status: string) => {
    try {
      await apiService.updateAppointmentStatus(appointmentId, status);
      
      // Update local state to reflect the change
      setAppointments(prevAppointments => 
        prevAppointments.map(appointment => 
          appointment.appointment_id === appointmentId
            ? { ...appointment, status }
            : appointment
        )
      );
    } catch (err) {
      setError('Failed to update appointment status');
      console.error('Error updating status:', err);
    }
  };
  
  // Filter appointments based on status and date filters
  const filteredAppointments = appointments.filter(appointment => {
    // Apply status filter
    if (statusFilter !== 'all' && appointment.status !== statusFilter) {
      return false;
    }
    
    // Apply date filter
    if (dateFilter !== 'all') {
      const appointmentDate = new Date(appointment.date_time);
      
      switch(dateFilter) {
        case 'today':
          return appointmentDate >= startOfToday && appointmentDate <= endOfToday;
        case 'thisWeek':
          return appointmentDate >= startOfWeek && appointmentDate <= endOfWeek;
        case 'upcoming':
          return appointmentDate >= today;
        case 'past':
          return appointmentDate < today;
      }
    }
    
    return true;
  });
  
  // Format date and time for display
  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    };
  };
  
  // Get status badge class based on appointment status
  const getStatusBadgeClass = (status: string) => {
    switch(status) {
      case 'scheduled':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      case 'rescheduled':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div data-testid="loading-spinner" className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
        <p>{error}</p>
      </div>
    );
  }
  
  if (appointments.length === 0) {
    return (
      <div className="text-center py-8">
        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
        <h3 className="text-lg font-medium text-gray-900">No appointments found</h3>
        <p className="mt-1 text-gray-500">
          {isClinicianView ? 
            "You don't have any scheduled appointments." : 
            "You don't have any scheduled appointments with your provider."
          }
        </p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between gap-4">
        <div>
          <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">Status:</label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="canceled">Canceled</option>
            <option value="rescheduled">Rescheduled</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="dateFilter" className="block text-sm font-medium text-gray-700 mb-1">Date:</label>
          <select
            id="dateFilter"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="upcoming">Upcoming</option>
            <option value="today">Today</option>
            <option value="thisWeek">This Week</option>
            <option value="past">Past</option>
            <option value="all">All Dates</option>
          </select>
        </div>
      </div>
      
      {filteredAppointments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No appointments match your filters.</p>
        </div>
      ) : (
        <div className="overflow-hidden bg-white shadow sm:rounded-md">
          <ul role="list" className="divide-y divide-gray-200">
            {filteredAppointments.map((appointment) => {
              const { date, time } = formatDateTime(appointment.date_time);
              return (
                <li key={appointment.appointment_id}>
                  <div className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <p className="truncate text-sm font-medium text-blue-600">
                            {isClinicianView 
                              ? `Appointment with ${appointment.patient_name}` 
                              : `Appointment with ${appointment.clinician_name}`
                            }
                          </p>
                        </div>
                        <div className="ml-2 flex-shrink-0">
                          <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusBadgeClass(appointment.status)}`}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex sm:space-x-4">
                          <div className="flex items-center text-sm text-gray-500">
                            <svg className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            {date}
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <svg className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            {time}
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <svg className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z"></path>
                            </svg>
                            {appointment.appointment_type === 'virtual' ? 'Virtual Visit' : 'In-Person Visit'}
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions based on appointment status */}
                      {appointment.status === 'scheduled' && (
                        <div className="mt-4 flex space-x-3">
                          {isClinicianView && (
                            <button 
                              onClick={() => updateAppointmentStatus(appointment.appointment_id, 'completed')}
                              className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                              Mark Completed
                            </button>
                          )}
                          <button 
                            onClick={() => updateAppointmentStatus(appointment.appointment_id, 'canceled')}
                            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          >
                            Cancel
                          </button>
                          <a 
                            href={`/schedule-appointment?reschedule=${appointment.appointment_id}`}
                            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          >
                            Reschedule
                          </a>
                        </div>
                      )}
                      
                      {appointment.status === 'completed' && isClinicianView && (
                        <div className="mt-4">
                          <a 
                            href={`/patient-records?id=${appointment.patient_id}`}
                            className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          >
                            View Patient Record
                          </a>
                        </div>
                      )}
                      
                      {appointment.status === 'canceled' && (
                        <div className="mt-4">
                          <a 
                            href={`/schedule-appointment?${isClinicianView ? `patient=${appointment.patient_id}` : `clinician=${appointment.clinician_id}`}`}
                            className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          >
                            Schedule New Appointment
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AppointmentsList;
