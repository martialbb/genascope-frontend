// src/utils/auth.ts
/**
 * Authentication utilities for both regular users and simplified patient access
 */

interface TokenPayload {
  access_type?: 'regular' | 'simplified';
  exp?: number;
  sub?: string;
  role?: string;
}

export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('authToken', token);
};

export const removeAuthToken = (): void => {
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
