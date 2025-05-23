import React, { createContext, useState, useContext } from 'react';
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
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Start loading initially to check auth
  const [error, setError] = useState<string | null>(null);

  // Implementation of login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      // Call your authentication API here
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        throw new Error('Login failed');
      }
      
      const userData = await response.json();
      setUser(userData);
      // Store token/user info in localStorage or sessionStorage
      localStorage.setItem('authToken', userData.token);
    } catch (err) {
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
      // Call logout API if needed
      // Remove token/user info from storage
      localStorage.removeItem('authToken');
      setUser(null);
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
      const token = localStorage.getItem('authToken');
      if (!token) {
        // No token found, user is not logged in
        setUser(null);
        return;
      }
      
      // Verify the token with your API
      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Authentication failed');
      }
      
      const userData = await response.json();
      setUser(userData);
    } catch (err) {
      // Token validation failed, clear it
      localStorage.removeItem('authToken');
      setUser(null);
      setError(err instanceof Error ? err.message : 'Authentication check failed');
    } finally {
      setLoading(false);
    }
  };

  // Check authentication status when component mounts
  React.useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};