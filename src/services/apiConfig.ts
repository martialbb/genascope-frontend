/**
 * API Configuration for Server-Side Proxied Requests
 * 
 * Uses local Astro server endpoints that proxy to the backend,
 * eliminating the need for client-side cross-origin requests.
 */

interface ApiEnvironmentConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  environment: 'development' | 'staging' | 'production';
}

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
    
    if (hostname === 'app.genascope.com' || hostname.includes('genascope.com')) {
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
 * Get the API base URL - always uses local server endpoints that proxy to backend
 * This eliminates CORS issues and allows backend to remain internal to Kubernetes
 */
function getApiBaseUrl(): string {
  // Always use the current frontend server's API proxy endpoint
  // This endpoint will proxy requests to the backend using internal Kubernetes DNS
  
  if (typeof window !== 'undefined') {
    // Client-side: use the current origin + /api/proxy
    const origin = window.location.origin;
    return `${origin}/api/proxy`;
  } else {
    // Server-side: use relative URL
    return '/api/proxy';
  }
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
 * Create a full API endpoint URL for server-side proxied requests
 * @param path The API endpoint path (with or without leading slash)
 * @returns The complete API URL that will be proxied to the backend
 */
export function getApiUrl(path: string): string {
  const baseUrl = API_CONFIG.baseUrl.replace(/\/+$/, ''); // Remove trailing slashes
  const cleanPath = path.replace(/^\/+/, ''); // Remove leading slashes
  return `${baseUrl}/${cleanPath}`;
}

// Development logging
if (typeof window !== 'undefined' && API_CONFIG.environment === 'development') {
  console.log('🔧 API Configuration (Server-Side Proxy):', {
    environment: API_CONFIG.environment,
    baseUrl: API_CONFIG.baseUrl,
    hostname: window.location.hostname,
    timeout: API_CONFIG.timeout,
    retries: API_CONFIG.retries,
    note: 'All API calls will be proxied through the frontend server to the backend'
  });
}
