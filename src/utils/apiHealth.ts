
/**
 * Utility functions for checking API health and availability
 */
import { API_CONFIG } from '../services/apiConfig';

interface ApiHealthCheck {
  endpoint: string;
  available: boolean;
  error?: string;
}

interface ApiHealthStatus {
  overall: boolean;
  endpoints: ApiHealthCheck[];
  usingMockData: boolean;
}

const REQUIRED_ENDPOINTS = [
  '/api/invites',
  '/api/clinicians',
  '/api/patients'
];

export async function checkApiHealth(): Promise<ApiHealthStatus> {
  const endpointChecks: ApiHealthCheck[] = [];
  let availableCount = 0;
  const baseUrl = API_CONFIG.baseUrl;

  // Get auth token for the health check - only on client side
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  for (const endpoint of REQUIRED_ENDPOINTS) {
    try {
      const fullUrl = `${baseUrl}${endpoint}`;
      const headers: Record<string, string> = {
        'Accept': 'application/json'
      };

      // Add auth header if token is available
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(fullUrl, {
        method: 'GET',
        headers
      });
      
      // Consider all responses except 404 and 500+ as available endpoints
      // 200 = OK, 401 = Unauthorized but exists, 403 = Forbidden but exists, 307 = Redirect but exists
      // The key insight: if we get 401/403, the endpoint exists but we need auth
      // The key insight: if we get 401/403, the endpoint exists but we need auth
      // Only 404 means the endpoint doesn't exist, 500+ means server error
      const available = response.status !== 404 && response.status < 500;
      if (available) availableCount++;
      
      endpointChecks.push({
        endpoint: fullUrl,
        available,
        error: available ? undefined : `HTTP ${response.status}`
      });
    } catch (error) {
      endpointChecks.push({
        endpoint: `${baseUrl}${endpoint}`,
        available: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  const overall = availableCount === REQUIRED_ENDPOINTS.length;
  const usingMockData = !overall;

  return {
    overall,
    endpoints: endpointChecks,
    usingMockData
  };
}

export function logApiStatus(status: ApiHealthStatus): void {
  console.group('🔍 API Health Check');
  console.log(`Overall Status: ${status.overall ? '✅ Available' : '❌ Unavailable'}`);
  console.log(`Using Mock Data: ${status.usingMockData ? '✅ Yes' : '❌ No'}`);
  
  console.group('Endpoint Details:');
  status.endpoints.forEach(endpoint => {
    const icon = endpoint.available ? '✅' : '❌';
    console.log(`${icon} ${endpoint.endpoint}${endpoint.error ? ` (${endpoint.error})` : ''}`);
  });
  console.groupEnd();
  console.groupEnd();
}

// Auto-check on module load in development - only on client side
if (import.meta.env.DEV && typeof window !== 'undefined') {
  checkApiHealth().then(logApiStatus);
}
