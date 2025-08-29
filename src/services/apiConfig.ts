/**
 * API Configuration for Multi-Environment Setup
 * 
 * Provides environment-aware backend URL detection for development, staging, and production.
 * Automatically detects the appropriate backend URL based on the current environment.
 */

interface ApiEnvironmentConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  environment: 'development' | 'staging' | 'production';
}

/**
 * Environment-specific backend URL mapping
 */
const ENVIRONMENT_BACKEND_URLS = {
  // Production URLs
  'genascope-frontend.fly.dev': 'https://genascope-backend.fly.dev',
  
  // Staging URLs  
  'genascope-frontend-staging.fly.dev': 'https://genascope-backend-staging.fly.dev',
  
  // Development URLs
  'genascope-frontend-dev.fly.dev': 'https://genascope-backend.fly.dev',
  'genascope-frontend-bold-paper-7916.fly.dev': 'https://genascope-backend.fly.dev',
  
  // Local development
  'localhost': 'http://localhost:8000',
  '127.0.0.1': 'http://localhost:8000'
};

/**
 * Determine the current environment based on hostname or environment variables
 */
function getCurrentEnvironment(): 'development' | 'staging' | 'production' {
  // Server-side environment detection
  if (typeof process !== 'undefined' && process.env.NODE_ENV) {
    const nodeEnv = process.env.NODE_ENV;
    if (['production', 'staging', 'development'].includes(nodeEnv)) {
      return nodeEnv as 'development' | 'staging' | 'production';
    }
  }
  
  // Client-side environment detection
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    if (hostname === 'genascope-frontend.fly.dev') {
      return 'production';
    }
    
    if (hostname.includes('staging')) {
      return 'staging';
    }
    
    if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
      return 'development';
    }
    
    // Default to development for unknown hostnames
    return 'development';
  }
  
  return 'development';
}

/**
 * Get the backend API URL based on current environment
 */
function getApiBaseUrl(): string {
  let baseUrl = '';
  
  // 1. Check for explicit environment variable (highest priority)
  if (typeof process !== 'undefined' && process.env.PUBLIC_API_URL) {
    baseUrl = process.env.PUBLIC_API_URL;
  }
  // 2. Client-side hostname-based detection
  else if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // Check against known hostname mappings
    for (const [domain, backendUrl] of Object.entries(ENVIRONMENT_BACKEND_URLS)) {
      if (hostname.includes(domain)) {
        baseUrl = backendUrl;
        break;
      }
    }
  }
  
  // 3. Server-side environment-based detection
  if (!baseUrl) {
    const environment = getCurrentEnvironment();
    switch (environment) {
      case 'production':
        baseUrl = 'https://genascope-backend.fly.dev';
        break;
      case 'staging':
        baseUrl = 'https://genascope-backend-staging.fly.dev';
        break;
      case 'development':
      default:
        baseUrl = 'http://localhost:8000';
        break;
    }
  }
  
  // Always remove trailing slashes to prevent double slashes
  return baseUrl.replace(/\/+$/, '');
}

/**
 * Create the API configuration object
 */
function createApiConfig(): ApiEnvironmentConfig {
  const environment = getCurrentEnvironment();
  const baseUrl = getApiBaseUrl();
  
  return {
    baseUrl,
    timeout: environment === 'production' ? 10000 : 30000,
    retries: environment === 'production' ? 3 : 1,
    environment
  };
}

// Export the API configuration
export const API_CONFIG = createApiConfig();

/**
 * Create a full API endpoint URL
 * @param path The API endpoint path (with or without leading slash)
 * @returns The complete API URL
 */
export function getApiUrl(path: string): string {
  const baseUrl = API_CONFIG.baseUrl.replace(/\/+$/, ''); // Remove trailing slashes
  const cleanPath = path.replace(/^\/+/, ''); // Remove leading slashes
  return `${baseUrl}/${cleanPath}`;
}

// Development logging
if (typeof window !== 'undefined' && API_CONFIG.environment === 'development') {
  console.log('🔧 API Configuration:', {
    environment: API_CONFIG.environment,
    baseUrl: API_CONFIG.baseUrl,
    hostname: window.location.hostname,
    timeout: API_CONFIG.timeout,
    retries: API_CONFIG.retries
  });
}
