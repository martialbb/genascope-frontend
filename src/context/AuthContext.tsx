import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import type { ReactNode } from 'react'; // Import ReactNode as a type


// Define the User type
interface User {
  id: string;
  email: string;
  role: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>; // Function to check auth status on load
  resetInactivityTimer: () => void; // Function to reset inactivity timer
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Create a custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
  inactivityTimeout?: number; // Timeout in milliseconds (default: 30 minutes)
}

export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  inactivityTimeout = 30 * 60 * 1000 // Default: 30 minutes in milliseconds
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Start loading initially to check auth
  const [error, setError] = useState<string | null>(null);
  const inactivityTimerRef = useRef<number | null>(null);

  // Reset the inactivity timer
  const resetInactivityTimer = () => {
    // Clear any existing timer
    if (inactivityTimerRef.current) {
      window.clearTimeout(inactivityTimerRef.current);
    }

    // Only set a new timer if user is logged in
    if (user) {
      inactivityTimerRef.current = window.setTimeout(() => {
        console.log("User inactive for too long, logging out");
        logout();
      }, inactivityTimeout);
    }
  };

  // Setup user activity event listeners to reset the timer
  useEffect(() => {
    if (!user) return; // Only track activity when user is logged in

    const activityEvents = [
      'mousedown', 'mousemove', 'keypress',
      'scroll', 'touchstart', 'click'
    ];

    const handleUserActivity = () => {
      resetInactivityTimer();
    };

    // Add event listeners
    activityEvents.forEach(event => {
      window.addEventListener(event, handleUserActivity);
    });

    // Initialize the timer
    resetInactivityTimer();

    // Cleanup event listeners when component unmounts
    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleUserActivity);
      });

      if (inactivityTimerRef.current) {
        window.clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [user, inactivityTimeout]);

  // Implementation of login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log("Starting login process for:", email);

      // Call your authentication API here
      const params = new URLSearchParams();
      params.append('username', email);
      params.append('password', password);
      params.append('grant_type', 'password');

      console.log("Sending token request to API");
      const response = await fetch('http://localhost:8000/api/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Login response not OK:", response.status, errorText);
        throw new Error(`Login failed: ${response.status} ${errorText}`);
      }
      
      const tokenData = await response.json();
      console.log("Received token data:", tokenData);
      localStorage.setItem('authToken', tokenData.access_token);

      // Fetch user details with the new token
      console.log("Fetching user details with token");
      const userResponse = await fetch('http://localhost:8000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`
        }
      });

      if (!userResponse.ok) {
        const errorText = await userResponse.text();
        console.error("User data response not OK:", userResponse.status, errorText);
        throw new Error(`Failed to fetch user data: ${userResponse.status} ${errorText}`);
      }

      const userDetails = await userResponse.json();
      console.log("Received user details:", userDetails);

      // Create a properly structured user object
      const userInfo: User = {
        id: userDetails.id || tokenData.user_id || "",
        email: email,
        name: userDetails.name || email.split('@')[0], // Fallback to username from email
        role: userDetails.role || "user" // Default role if none specified
      };

      console.log("Setting user in context:", userInfo);

      // Save user info to localStorage for persistence
      localStorage.setItem('authUser', JSON.stringify(userInfo));
      setUser(userInfo);
    } catch (err) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err.message : 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  // Implementation of logout function
  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      // Remove token/user info from all storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      setUser(null);

      // Redirect to login page
      window.location.href = '/login';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during logout');
    } finally {
      setLoading(false);
    }
  };

  // Implementation of checkAuth function
  const checkAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Checking authentication status");
      const token = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('authUser');

      if (!token) {
        console.log("No auth token found in localStorage");
        setUser(null);
        setLoading(false);
        return;
      }

      console.log("Found token in localStorage");

      // First restore user from localStorage for quick UI display
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log("Restored user from localStorage:", parsedUser);
          setUser(parsedUser);
        } catch (e) {
          console.error("Error parsing stored user data", e);
        }
      } else {
        console.log("No stored user found in localStorage");
      }

      // Then verify the token with the API for fresh data
      try {
        console.log("Fetching fresh user data from API");
        const response = await fetch('http://localhost:8000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const userDetails = await response.json();
          console.log("Received fresh user details:", userDetails);

          // Create a properly structured user object
          const userInfo: User = {
            id: userDetails.id || "",
            email: userDetails.email || "",
            name: userDetails.name || userDetails.email?.split('@')[0] || "User",
            role: userDetails.role || "user"
          };

          console.log("Updated user info:", userInfo);

          // Update localStorage and state with fresh data
          localStorage.setItem('authUser', JSON.stringify(userInfo));
          setUser(userInfo);
        } else {
          console.warn("API auth check failed:", response.status);
          // Keep using stored user data, don't log out the user
        }
      } catch (apiErr) {
        console.warn("Could not refresh user data from API:", apiErr);
        // Still keep the user logged in with stored data
      }
    } catch (err) {
      // Major error in the auth process
      console.error("Authentication check error:", err);
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      setUser(null);
      setError(err instanceof Error ? err.message : 'Authentication check failed');
    } finally {
      setLoading(false);
    }
  };

  // Check authentication status when component mounts
  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, checkAuth, resetInactivityTimer }}>
      {children}
    </AuthContext.Provider>
  );
};

