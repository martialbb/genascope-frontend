// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, type ReactNode } from 'react'; // Use 'type ReactNode'
import axios from 'axios';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'clinician' | 'admin' | 'super_admin'; // Define roles as needed
  accountId?: string; // Optional: For account admins/clinicians
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

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Start loading initially to check auth
  const [error, setError] = useState<string | null>(null);

  // Mock checkAuth: Check local storage or session for token/user info
  const checkAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate checking a token (e.g., in localStorage)
      await new Promise(resolve => setTimeout(resolve, 300));
      const storedUser = localStorage.getItem('authUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
      // In a real app, you'd verify the token with the backend:
      // const response = await axios.get('/api/auth/me');
      // setUser(response.data.user);
    } catch (err) {
      console.error("Auth check failed:", err);
      setUser(null);
      localStorage.removeItem('authUser'); // Clear invalid stored user
    } finally {
      setLoading(false);
    }
  };

  // Mock login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Attempting login for:', email);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock response based on email/password (VERY INSECURE - FOR DEMO ONLY)
      let loggedInUser: User | null = null;
      if (email === 'super@test.com' && password === 'password') {
        loggedInUser = { id: 'u001', email: 'super@test.com', name: 'Super Admin', role: 'super_admin' };
      } else if (email === 'admin@test.com' && password === 'password') {
        loggedInUser = { id: 'u002', email: 'admin@test.com', name: 'Account Admin', role: 'admin', accountId: 'acc001' };
      } else if (email === 'clinician@test.com' && password === 'password') {
        loggedInUser = { id: 'u003', email: 'clinician@test.com', name: 'Dr. Clinician', role: 'clinician', accountId: 'acc001' };
      }

      if (loggedInUser) {
        setUser(loggedInUser);
        localStorage.setItem('authUser', JSON.stringify(loggedInUser)); // Store user info
        // Redirect happens in the component/page after successful login
      } else {
        throw new Error('Invalid email or password');
      }

      // Replace with actual API call:
      // const response = await axios.post('/api/auth/login', { email, password });
      // setUser(response.data.user);
      // localStorage.setItem('authToken', response.data.token); // Store token

    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.message || 'Login failed. Please try again.');
      setUser(null);
      localStorage.removeItem('authUser');
    } finally {
      setLoading(false);
    }
  };

  // Mock logout function
  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Logging out...');
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // Replace with actual API call:
      // await axios.post('/api/auth/logout');

      setUser(null);
      localStorage.removeItem('authUser'); // Clear stored user/token
      // Redirect happens in the component/page after logout
      window.location.href = '/login'; // Force redirect to login
    } catch (err: any) {
      console.error('Logout failed:', err);
      setError(err.message || 'Logout failed. Please try again.');
      // Even if logout API fails, clear local state
      setUser(null);
      localStorage.removeItem('authUser');
    } finally {
      setLoading(false);
    }
  };

  // Check authentication status when the provider mounts
  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
