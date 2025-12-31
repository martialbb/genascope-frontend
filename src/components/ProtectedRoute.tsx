// src/components/ProtectedRoute.tsx
/**
 * Route guard component that protects routes from unauthorized access.
 * - Blocks unauthenticated users (redirects to login)
 * - Blocks simplified access users (redirects to chat)
 * - Optionally checks for specific roles
 */
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, isSimplifiedAccess, getCurrentUser } from '../utils/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles,
  redirectTo = '/login'
}) => {
  const location = useLocation();
  const [authState, setAuthState] = useState<'loading' | 'authenticated' | 'simplified' | 'unauthenticated'>('loading');
  const [hasPermission, setHasPermission] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      // Check if user is authenticated at all
      if (!isAuthenticated()) {
        console.log('ProtectedRoute: User not authenticated, redirecting to login');
        setAuthState('unauthenticated');
        return;
      }

      // Check if user has simplified access (patient via invite link)
      if (isSimplifiedAccess()) {
        console.log('ProtectedRoute: User has simplified access, redirecting to chat');
        setAuthState('simplified');
        return;
      }

      // Check role-based permissions if specified
      if (allowedRoles && allowedRoles.length > 0) {
        const userData = localStorage.getItem('authUser');
        if (userData) {
          try {
            const user = JSON.parse(userData);
            if (!allowedRoles.includes(user.role)) {
              console.log(`ProtectedRoute: User role '${user.role}' not in allowed roles:`, allowedRoles);
              setHasPermission(false);
            }
          } catch (e) {
            console.error('ProtectedRoute: Error parsing user data');
            setHasPermission(false);
          }
        } else {
          // No user data but authenticated - might be a token without user info
          console.log('ProtectedRoute: No user data found');
          setHasPermission(false);
        }
      }

      setAuthState('authenticated');
    };

    checkAuth();
  }, [allowedRoles]);

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
    return <Navigate to={`${redirectTo}?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // Redirect simplified access users to chat
  if (authState === 'simplified') {
    return <Navigate to="/ai-chat/sessions?new=true" replace />;
  }

  // Redirect users without proper role permissions to dashboard with error
  if (!hasPermission) {
    return <Navigate to="/dashboard?error=permission" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

