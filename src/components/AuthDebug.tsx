import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

// This component will help debug authentication issues
const AuthDebug: React.FC = () => {
  const { user, loading, error, checkAuth } = useAuth();

  useEffect(() => {
    // Try to manually initialize auth on component mount
    const init = async () => {
      console.log("AuthDebug: Attempting to initialize authentication");
      const token = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('authUser');

      console.log("AuthDebug: Found token?", !!token);
      console.log("AuthDebug: Found stored user?", !!storedUser);

      if (storedUser) {
        try {
          console.log("AuthDebug: Stored user data:", JSON.parse(storedUser));
        } catch (e) {
          console.error("AuthDebug: Error parsing stored user", e);
        }
      }

      // Force a check auth if the function exists
      if (typeof checkAuth === 'function') {
        await checkAuth();
      } else {
        console.warn("AuthDebug: checkAuth function is not available");
      }
    };

    init();
  }, [checkAuth]);

  console.log("AuthDebug render - User:", user);
  console.log("AuthDebug render - Loading:", loading);
  console.log("AuthDebug render - Error:", error);

  // Don't render anything - this is just for debugging
  return null;
};

export default AuthDebug;
