// src/utils/auth.ts
/**
 * Authentication utilities for both regular users and simplified patient access
 */

interface TokenPayload {
  access_type?: 'regular' | 'simplified';
  exp?: number;
  sub?: string;
  id?: string; // patient ID from simplified access tokens
  role?: string;
  patient_id?: string;
  user_id?: string;
  name?: string;
  email?: string;
  invite_id?: string; // Invite ID for simplified access
  chat_strategy_id?: string; // Chat strategy from invite
}

export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null; // Server-side rendering check
  return localStorage.getItem('authToken');
};

export const setAuthToken = (token: string): void => {
  if (typeof window === 'undefined') return; // Server-side rendering check
  localStorage.setItem('authToken', token);
};

export const removeAuthToken = (): void => {
  if (typeof window === 'undefined') return; // Server-side rendering check
  localStorage.removeItem('authToken');
};

export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  if (!token) return false;
  
  try {
    const payload = parseJWT(token);
    return payload.exp ? payload.exp * 1000 > Date.now() : false;
  } catch {
    return false;
  }
};

export const isSimplifiedAccess = (): boolean => {
  const token = getAuthToken();
  if (!token) return false;
  
  try {
    const payload = parseJWT(token);
    return payload.access_type === 'simplified';
  } catch {
    return false;
  }
};

export const getTokenExpiration = (): Date | null => {
  const token = getAuthToken();
  if (!token) return null;
  
  try {
    const payload = parseJWT(token);
    return payload.exp ? new Date(payload.exp * 1000) : null;
  } catch {
    return null;
  }
};

export const getRemainingTime = (): number | null => {
  const expiration = getTokenExpiration();
  if (!expiration) return null;
  
  const remaining = expiration.getTime() - Date.now();
  return remaining > 0 ? remaining : 0;
};

export const isTokenExpired = (token?: string): boolean => {
  const authToken = token || getAuthToken();
  if (!authToken) return true;
  
  try {
    const payload = parseJWT(authToken);
    return payload.exp ? payload.exp * 1000 <= Date.now() : true;
  } catch {
    return true;
  }
};

export const getCurrentUser = (token?: string): TokenPayload | null => {
  const authToken = token || getAuthToken();
  if (!authToken) return null;
  
  try {
    return parseJWT(authToken);
  } catch {
    return null;
  }
};

// Helper function to parse JWT without verification (for client-side info only)
const parseJWT = (token: string): TokenPayload => {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
  
  return JSON.parse(jsonPayload);
};

// Auto-logout when token expires
export const setupTokenExpirationCheck = (onExpired?: () => void): (() => void) => {
  const checkExpiration = () => {
    if (!isAuthenticated()) {
      removeAuthToken();
      onExpired?.();
    }
  };
  
  // Check every minute
  const interval = setInterval(checkExpiration, 60000);
  
  // Return cleanup function
  return () => clearInterval(interval);
};
