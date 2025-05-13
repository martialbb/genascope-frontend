// src/components/SchedulingComponent.tsx
import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import { useAuth } from '../context/AuthContext';

interface TimeSlot {
  time: string;
  available: boolean;
}

interface AvailabilityResponse {
  date: string;
  clinician_id: string;
  clinician_name: string;
  time_slots: TimeSlot[];
}

interface SchedulingProps {
  clinicianId?: string;
  patientId?: string;
  afterBooking?: (appointmentId: string) => void;
}

const SchedulingComponent: React.FC<SchedulingProps> = ({ 
  clinicianId = '', 
  patientId = '',
  afterBooking 
}) => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [clinicianName, setClinicianName] = useState<string>('');
  const [appointmentType, setAppointmentType] = useState<'virtual' | 'in-person'>('virtual');
  const [notes, setNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [appointmentId, setAppointmentId] = useState<string>('');
  const [confirmationCode, setConfirmationCode] = useState<string>('');

  // Calculate min and max dates for the date picker
  const today = new Date();
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3); // Allow booking up to 3 months in advance
  
  const minDateString = today.toISOString().split('T')[0];
  const maxDateString = maxDate.toISOString().split('T')[0];

  // Fetch available time slots when a date is selected
  useEffect(() => {
    if (selectedDate && clinicianId) {
      setIsLoading(true);
      setError(null);
      
      apiService.getAvailability(clinicianId, selectedDate)
        .then((response: AvailabilityResponse) => {
          setTimeSlots(response.time_slots);
          setClinicianName(response.clinician_name);
        })
        .catch((err) => {
          setError('Failed to load availability. Please try again.');
          console.error('Error fetching availability:', err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [selectedDate, clinicianId]);

  // Reset selected time when date changes
  useEffect(() => {
    setSelectedTime('');
  }, [selectedDate]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const handleTimeClick = (time: string, available: boolean) => {
    if (!available) return;
    setSelectedTime(time);
  };

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedTime) {
      setError('Please select a date and time.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const appointmentData = {
        clinician_id: clinicianId,
        date: selectedDate,
        time: selectedTime,
        patient_id: patientId || user?.id || '',
        appointment_type: appointmentType,
        notes: notes
      };

      const response = await apiService.bookAppointment(appointmentData);
      
      setAppointmentId(response.appointment_id);
      setConfirmationCode(response.confirmation_code);
      setSuccess(true);
      
      if (afterBooking) {
        afterBooking(response.appointment_id);
      }
    } catch (err) {
      setError('Failed to book appointment. Please try again.');
      console.error('Error booking appointment:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="text-center">
          <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Appointment Confirmed!</h2>
          <p className="text-gray-600 mb-4">Your appointment has been successfully scheduled.</p>
          
          <div className="bg-gray-50 p-4 rounded-md mb-4">
            <p className="text-gray-700"><span className="font-medium">Date:</span> {selectedDate}</p>
            <p className="text-gray-700"><span className="font-medium">Time:</span> {selectedTime}</p>
            <p className="text-gray-700"><span className="font-medium">Provider:</span> {clinicianName}</p>
            <p className="text-gray-700"><span className="font-medium">Type:</span> {appointmentType === 'virtual' ? 'Virtual Visit' : 'In-Person Visit'}</p>
            <p className="text-gray-700"><span className="font-medium">Confirmation Code:</span> <span className="font-mono font-bold">{confirmationCode}</span></p>
          </div>
          
          <p className="text-sm text-gray-500 mb-4">A confirmation email has been sent to your registered email address.</p>
          
          <button 
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            onClick={() => setSuccess(false)}
          >
            Schedule Another Appointment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Schedule an Appointment</h2>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      <div className="mb-4">
        <label htmlFor="date" className="block text-gray-700 font-medium mb-2">
          Select Date
        </label>
        <input
          type="date"
          id="date"
          min={minDateString}
          max={maxDateString}
          value={selectedDate}
          onChange={handleDateChange}
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      {isLoading && (
        <div className="flex justify-center my-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {selectedDate && timeSlots.length > 0 && (
        <>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Available Times with {clinicianName}
            </label>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
              {timeSlots.map((slot) => (
                <button
                  key={slot.time}
                  disabled={!slot.available}
                  onClick={() => handleTimeClick(slot.time, slot.available)}
                  className={`
                    p-2 rounded-md transition-colors
                    ${!slot.available 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                      : selectedTime === slot.time
                        ? 'bg-blue-500 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          </div>

          {selectedTime && (
            <>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Appointment Type
                </label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio text-blue-500"
                      name="appointmentType"
                      value="virtual"
                      checked={appointmentType === 'virtual'}
                      onChange={() => setAppointmentType('virtual')}
                    />
                    <span className="ml-2">Virtual Visit</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio text-blue-500"
                      name="appointmentType"
                      value="in-person"
                      checked={appointmentType === 'in-person'}
                      onChange={() => setAppointmentType('in-person')}
                    />
                    <span className="ml-2">In-Person Visit</span>
                  </label>
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="notes" className="block text-gray-700 font-medium mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Add any notes or questions for your provider..."
                ></textarea>
              </div>

              <div className="bg-blue-50 p-4 rounded-md mb-4">
                <h3 className="font-semibold text-blue-800">Appointment Summary</h3>
                <p className="text-blue-800">Date: {selectedDate}</p>
                <p className="text-blue-800">Time: {selectedTime}</p>
                <p className="text-blue-800">Provider: {clinicianName}</p>
                <p className="text-blue-800">Type: {appointmentType === 'virtual' ? 'Virtual Visit' : 'In-Person Visit'}</p>
              </div>

              <button
                onClick={handleBookAppointment}
                disabled={isLoading}
                className={`
                  w-full py-2 px-4 rounded font-bold
                  ${isLoading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }
                `}
              >
                {isLoading ? 'Booking...' : 'Book Appointment'}
              </button>
            </>
          )}
        </>
      )}
      
      {selectedDate && timeSlots.length === 0 && !isLoading && (
        <div className="text-center py-4">
          <p className="text-gray-700">No time slots available for the selected date.</p>
          <p className="text-gray-500">Please select a different date.</p>
        </div>
      )}
    </div>
  );
};

export default SchedulingComponent;
