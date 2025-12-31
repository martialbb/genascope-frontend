// src/components/SimplifiedAccessGuard.tsx
/**
 * Route guard for pages accessible to simplified access patients (chat pages).
 * - Allows both regular authenticated users and simplified access users
 * - Blocks unauthenticated users (redirects to login)
 * 
 * Use this for routes that should be accessible to patients using invite links.
 */
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, isSimplifiedAccess, isTokenExpired } from '../utils/auth';

interface SimplifiedAccessGuardProps {
  children: React.ReactNode;
}

const SimplifiedAccessGuard: React.FC<SimplifiedAccessGuardProps> = ({ children }) => {
  const location = useLocation();
  const [authState, setAuthState] = useState<'loading' | 'authenticated' | 'unauthenticated' | 'expired'>('loading');

  useEffect(() => {
    const checkAuth = () => {
      // Check if user is authenticated at all
      if (!isAuthenticated()) {
        // Check if there's a token that's expired
        const token = localStorage.getItem('authToken');
        if (token && isTokenExpired(token)) {
          console.log('SimplifiedAccessGuard: Token expired');
          setAuthState('expired');
          return;
        }
        
        console.log('SimplifiedAccessGuard: User not authenticated');
        setAuthState('unauthenticated');
        return;
      }

      // Both regular users and simplified access users can access these routes
      const accessType = isSimplifiedAccess() ? 'simplified' : 'regular';
      console.log(`SimplifiedAccessGuard: User authenticated with ${accessType} access`);
      setAuthState('authenticated');
    };

    checkAuth();
  }, []);

  // Show loading state briefly
  if (authState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Redirect unauthenticated users to login
  if (authState === 'unauthenticated') {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // Show expired message for expired tokens
  if (authState === 'expired') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md text-center">
          <div className="text-yellow-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h3 className="text-lg font-medium mt-2">Session Expired</h3>
          </div>
          <p className="text-gray-700 mb-6">
            Your session has expired. Please use your invitation link to start a new session, or contact your healthcare provider for a new invitation.
          </p>
          <a 
            href="/" 
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
          >
            Return to Homepage
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default SimplifiedAccessGuard;

