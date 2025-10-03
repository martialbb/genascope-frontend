/**
 * API Configuration for Vite React SPA
 * 
 * Uses Vite dev server proxy in development and direct API calls in production.
 */

interface ApiEnvironmentConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  environment: 'development' | 'staging' | 'production';
}

/**
 * Determine the API base URL based on environment
 */
function getApiBaseUrl(): string {
  // Always use /api for both development and production
  // In development: Vite dev server proxy handles routing
  // In production: nginx proxy handles routing to backend
  return '/api'
}

/**
 * Determine the current environment based on hostname or environment variables
 */
function getCurrentEnvironment(): 'development' | 'staging' | 'production' {
  // Vite environment detection
  const viteMode = (import.meta.env as any).MODE;
  if (viteMode && ['production', 'staging', 'development'].includes(viteMode)) {
    return viteMode as 'development' | 'staging' | 'production';
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
  console.log('🔧 API Configuration (Vite SPA):', {
    environment: API_CONFIG.environment,
    baseUrl: API_CONFIG.baseUrl,
    hostname: window.location.hostname,
    timeout: API_CONFIG.timeout,
    retries: API_CONFIG.retries,
    note: 'All API calls will be proxied through Vite dev server to the backend'
  });
}
