// src/components/ClinicianAvailabilityManager.tsx
import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

interface AvailabilityProps {
  clinicianId?: string;
}

type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Monday, 6 = Sunday

interface RecurringAvailability {
  days: DayOfWeek[];
  until: string;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Monday' },
  { value: 1, label: 'Tuesday' },
  { value: 2, label: 'Wednesday' },
  { value: 3, label: 'Thursday' },
  { value: 4, label: 'Friday' },
  { value: 5, label: 'Saturday' },
  { value: 6, label: 'Sunday' },
];

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', 
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00'
];

const ClinicianAvailabilityManager: React.FC<AvailabilityProps> = ({ clinicianId }) => {
  const [effectiveClinicianId, setEffectiveClinicianId] = useState<string | null>(clinicianId || null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [recurringDays, setRecurringDays] = useState<DayOfWeek[]>([]);
  const [recurringUntil, setRecurringUntil] = useState<string>('');
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Get clinician ID from localStorage if not provided as prop
  useEffect(() => {
    if (!effectiveClinicianId) {
      try {
        const userData = localStorage.getItem('authUser');
        if (userData) {
          const user = JSON.parse(userData);
          setEffectiveClinicianId(user.id);
        }
      } catch (error) {
        console.error('Error getting user from localStorage:', error);
        setError('Unable to identify clinician. Please log in again.');
      }
    }
  }, [effectiveClinicianId]);
  
  // Calculate min date (today) for date picker
  const today = new Date();
  const minDateString = today.toISOString().split('T')[0];
  
  // Calculate max date (1 year from now) for recurring until date picker
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);
  const maxDateString = maxDate.toISOString().split('T')[0];

  const handleTimeSlotToggle = (timeSlot: string) => {
    setSelectedTimeSlots(prev => 
      prev.includes(timeSlot)
        ? prev.filter(slot => slot !== timeSlot)
        : [...prev, timeSlot]
    );
  };

  const handleDayToggle = (day: DayOfWeek) => {
    setRecurringDays(prev => 
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const validateForm = (): boolean => {
    if (!selectedDate) {
      setError('Please select a date.');
      return false;
    }

    if (selectedTimeSlots.length === 0) {
      setError('Please select at least one time slot.');
      return false;
    }

    if (isRecurring) {
      if (recurringDays.length === 0) {
        setError('Please select at least one day for recurring availability.');
        return false;
      }

      if (!recurringUntil) {
        setError('Please select an end date for recurring availability.');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!effectiveClinicianId) {
      setError('Unable to identify clinician. Please log in again.');
      return;
    }
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const availabilityData = {
        clinician_id: effectiveClinicianId,
        date: selectedDate,
        time_slots: selectedTimeSlots,
        is_recurring: isRecurring,
        recurring_days: isRecurring ? recurringDays : undefined,
        recurring_until: isRecurring ? recurringUntil : undefined
      };

      await apiService.setClinicianAvailability(effectiveClinicianId!, availabilityData);
      
      setSuccess(true);
      setSelectedTimeSlots([]);
      
      // If non-recurring, clear the date after submission
      if (!isRecurring) {
        setSelectedDate('');
      }
    } catch (err) {
      setError('Failed to set availability. Please try again.');
      console.error('Error setting availability:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Set Your Availability</h2>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert">
          <p>Availability successfully updated!</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <div className="flex items-center">
            <input
              id="recurring"
              type="checkbox"
              checked={isRecurring}
              onChange={() => setIsRecurring(!isRecurring)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="recurring" className="ml-2 block text-gray-700">
              Set recurring availability
            </label>
          </div>
        </div>

        {isRecurring ? (
          <>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Select Days
              </label>
              <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => handleDayToggle(day.value as DayOfWeek)}
                    className={`
                      py-2 px-4 text-sm rounded-md transition-colors
                      ${recurringDays.includes(day.value as DayOfWeek)
                        ? 'bg-blue-500 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="untilDate" className="block text-gray-700 font-medium mb-2">
                Repeat Until
              </label>
              <input
                type="date"
                id="untilDate"
                min={minDateString}
                max={maxDateString}
                value={recurringUntil}
                onChange={(e) => setRecurringUntil(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="startDate" className="block text-gray-700 font-medium mb-2">
                Starting From
              </label>
              <input
                type="date"
                id="startDate"
                min={minDateString}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        ) : (
          <div className="mb-4">
            <label htmlFor="date" className="block text-gray-700 font-medium mb-2">
              Select Date
            </label>
            <input
              type="date"
              id="date"
              min={minDateString}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Select Available Time Slots
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {TIME_SLOTS.map((timeSlot) => (
              <button
                key={timeSlot}
                type="button"
                onClick={() => handleTimeSlotToggle(timeSlot)}
                className={`
                  p-2 rounded-md transition-colors
                  ${selectedTimeSlots.includes(timeSlot)
                    ? 'bg-blue-500 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                {timeSlot}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`
            w-full py-2 px-4 rounded font-bold
            ${isSubmitting 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
            }
          `}
        >
          {isSubmitting ? 'Submitting...' : 'Save Availability'}
        </button>
      </form>
    </div>
  );
};

export default ClinicianAvailabilityManager;
