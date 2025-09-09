/**
 * Server-side API configuration for backend communication
 * 
 * This configuration is used by Astro server-side API routes to communicate
 * directly with the backend using Kubernetes internal DNS.
 */

interface ServerApiConfig {
  baseUrl: string;
  timeout: number;
}

/**
 * Get the backend URL for server-side communication
 * Uses Kubernetes internal DNS which is only available from within the cluster
 */
function getServerApiConfig(): ServerApiConfig {
  // Check for environment-specific backend URLs
  const backendUrl = process.env.BACKEND_URL || 
                    process.env.PUBLIC_BACKEND_URL ||
                    getDefaultBackendUrl();

  return {
    baseUrl: backendUrl.replace(/\/+$/, ''), // Remove trailing slashes
    timeout: 30000 // 30 second timeout for server-side calls
  };
}

/**
 * Get the default backend URL based on environment
 */
function getDefaultBackendUrl(): string {
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  switch (nodeEnv) {
    case 'production':
      return 'http://genascope-backend.production.svc.cluster.local:80';
    case 'staging':
      return 'http://genascope-backend.staging.svc.cluster.local:80';
    case 'development':
    default:
      // For Kubernetes dev environment
      if (process.env.KUBERNETES_SERVICE_HOST) {
        return 'http://genascope-backend.dev.svc.cluster.local:80';
      }
      // For local development
      return 'http://localhost:8000';
  }
}

export const SERVER_API_CONFIG = getServerApiConfig();

/**
 * Create a full backend API endpoint URL for server-side calls
 * @param path The API endpoint path
 * @returns The complete backend API URL
 */
export function getBackendApiUrl(path: string): string {
  const baseUrl = SERVER_API_CONFIG.baseUrl;
  // Don't remove leading or trailing slashes - preserve them exactly as passed
  const cleanPath = path.replace(/^\/+/, ''); // Only remove leading slashes
  const fullUrl = `${baseUrl}/${cleanPath}`;
  
  console.log(`🔍 URL Construction - Input path: "${path}"`);
  console.log(`🔍 URL Construction - Clean path: "${cleanPath}"`);
  console.log(`🔍 URL Construction - Full URL: "${fullUrl}"`);
  
  return fullUrl;
}

// Server-side logging
console.log('🔧 Server API Configuration:', {
  nodeEnv: process.env.NODE_ENV,
  backendUrl: SERVER_API_CONFIG.baseUrl,
  kubernetesHost: process.env.KUBERNETES_SERVICE_HOST ? 'detected' : 'not detected',
  timeout: SERVER_API_CONFIG.timeout
});
