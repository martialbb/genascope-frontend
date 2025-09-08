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
 * Kubernetes hostnames and local development
 */
const ENVIRONMENT_BACKEND_URLS = {
  // Production URLs (Kubernetes)
  'genascope.yourdomain.com': 'http://genascope-backend.production.svc.cluster.local:80',
  'genascope-frontend.local': 'http://genascope-backend.production.svc.cluster.local:80',
  
  // Staging URLs (Kubernetes)
  'genascope-frontend-staging.yourdomain.com': 'http://genascope-backend.staging.svc.cluster.local:80',
  'genascope-frontend-staging.local': 'http://genascope-backend.staging.svc.cluster.local:80',
  
  // Development URLs (Kubernetes)
  'genascope-dev.local': 'http://genascope-backend:80',
  'genascope-frontend-dev.local': 'http://genascope-backend:80',
  
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
    
    if (hostname === 'genascope.yourdomain.com' || hostname === 'genascope-frontend.local') {
      return 'production';
    }
    
    if (hostname.includes('staging')) {
      return 'staging';
    }
    
    if (hostname.includes('localhost') || hostname.includes('127.0.0.1') || hostname.includes('dev')) {
      return 'development';
    }
    
    // Default to development for unknown hostnames
    return 'development';
  }
  
  return 'development';
}

/**
 * Get the backend API URL based on current environment
 * Prioritizes runtime server endpoint over build-time environment variables
 */
function getApiBaseUrl(): string {
  let baseUrl = '';
  
  // 1. Try to get runtime backend URL from a server endpoint (highest priority)
  if (typeof window !== 'undefined') {
    // Check if we can get the backend URL from the current page's base
    const currentHost = window.location.hostname;
    
    // Map known hostnames to their backend URLs
    if (currentHost === 'genascope-dev.local' || currentHost.includes('dev')) {
      baseUrl = 'http://genascope-backend.dev.svc.cluster.local:80';
    } else if (currentHost.includes('staging')) {
      baseUrl = 'http://genascope-backend.staging.svc.cluster.local:80';
    } else if (currentHost === 'app.genascope.com' || currentHost.includes('genascope.com')) {
      baseUrl = 'http://genascope-backend.production.svc.cluster.local:80';
    }
  }
  
  // 2. Check for Astro environment variables (build-time)
  if (!baseUrl && import.meta.env.PUBLIC_API_URL) {
    baseUrl = import.meta.env.PUBLIC_API_URL;
  }
  
  // 3. Server-side environment check
  if (!baseUrl && typeof process !== 'undefined' && process.env.PUBLIC_API_URL) {
    baseUrl = process.env.PUBLIC_API_URL;
  }
  
  // 4. Environment-based fallback
  if (!baseUrl) {
    const environment = getCurrentEnvironment();
    switch (environment) {
      case 'production':
        baseUrl = 'http://genascope-backend.production.svc.cluster.local:80';
        break;
      case 'staging':
        baseUrl = 'http://genascope-backend.staging.svc.cluster.local:80';
        break;
      case 'development':
      default:
        // For local development, use localhost
        if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
          baseUrl = 'http://localhost:8000';
        } else {
          // For Kubernetes dev environment
          baseUrl = 'http://genascope-backend.dev.svc.cluster.local:80';
        }
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
