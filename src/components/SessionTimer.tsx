// src/components/SessionTimer.tsx
import React, { useState, useEffect } from 'react';
import { isSimplifiedAccess, getRemainingTime, removeAuthToken } from '../utils/auth';

const SessionTimer: React.FC = () => {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;
    
    if (!isSimplifiedAccess()) return;

    const updateTimer = () => {
      const remaining = getRemainingTime();
      setTimeRemaining(remaining);
      
      // Show warning when less than 30 minutes remaining
      if (remaining && remaining < 30 * 60 * 1000) {
        setShowWarning(true);
      }
      
      // Auto-logout when expired
      if (remaining === 0) {
        removeAuthToken();
        window.location.href = '/';
      }
    };

    // Update immediately
    updateTimer();

    // Update every minute
    const interval = setInterval(updateTimer, 60000);

    return () => clearInterval(interval);
  }, []);

  if (!isSimplifiedAccess() || !timeRemaining) {
    return null;
  }

  const formatTime = (ms: number): string => {
    const totalMinutes = Math.floor(ms / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className={`fixed top-4 right-4 p-3 rounded-lg shadow-lg z-50 ${
      showWarning ? 'bg-orange-100 border border-orange-300' : 'bg-blue-100 border border-blue-300'
    }`}>
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${showWarning ? 'bg-orange-500' : 'bg-blue-500'}`}></div>
        <span className={`text-sm font-medium ${showWarning ? 'text-orange-800' : 'text-blue-800'}`}>
          Session: {formatTime(timeRemaining)} remaining
        </span>
      </div>
      {showWarning && (
        <p className="text-xs text-orange-700 mt-1">
          Your session will expire soon. Please complete your assessment.
        </p>
      )}
    </div>
  );
};

export default SessionTimer;
