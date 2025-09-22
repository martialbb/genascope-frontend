/**
 * Server-side API proxy service
 * 
 * Handles communication with the backend API using Kubernetes internal DNS.
 * This service runs on the server and proxies requests from the frontend.
 */

import { getBackendApiUrl, SERVER_API_CONFIG } from '../utils/serverApiConfig.js';

interface ProxyRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  timeout?: number;
}

interface ProxyResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status: number;
}

/**
 * Make a proxied request to the backend API
 */
export async function proxyBackendRequest<T = any>(
  endpoint: string,
  options: ProxyRequestOptions = {}
): Promise<ProxyResponse<T>> {
  const {
    method = 'GET',
    body,
    headers = {},
    timeout = SERVER_API_CONFIG.timeout
  } = options;

  const url = getBackendApiUrl(endpoint);
  
  try {
    console.log(`🔄 Proxying ${method} request to: ${url}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const requestInit: RequestInit = {
      method,
      headers: {
        'Accept': 'application/json',
        ...headers
      },
      signal: controller.signal
    };

    if (body && method !== 'GET') {
      if (body instanceof FormData) {
        // Don't set Content-Type for FormData, let the browser set it with boundary
        requestInit.body = body;
      } else if (typeof body === 'string') {
        requestInit.headers = {
          'Content-Type': 'application/json',
          ...requestInit.headers
        };
        requestInit.body = body;
      } else if (headers['Content-Type'] === 'application/x-www-form-urlencoded') {
        // Convert object to URL-encoded string for auth endpoints
        const params = new URLSearchParams();
        Object.entries(body).forEach(([key, value]) => {
          params.append(key, String(value));
        });
        requestInit.headers = {
          'Content-Type': 'application/x-www-form-urlencoded',
          ...requestInit.headers
        };
        requestInit.body = params.toString();
        console.log('🔄 Sending form-encoded data:', params.toString());
      } else {
        requestInit.headers = {
          'Content-Type': 'application/json',
          ...requestInit.headers
        };
        requestInit.body = JSON.stringify(body);
      }
    } else {
      requestInit.headers = {
        'Content-Type': 'application/json',
        ...requestInit.headers
      };
    }

    const response = await fetch(url, requestInit);
    clearTimeout(timeoutId);

    const responseData = await response.json().catch(() => null);

    if (!response.ok) {
      console.error(`❌ Backend request failed: ${response.status} ${response.statusText}`, responseData);
      return {
        success: false,
        error: responseData?.detail || response.statusText,
        status: response.status
      };
    }

    console.log(`✅ Backend request successful: ${response.status}`);
    return {
      success: true,
      data: responseData,
      status: response.status
    };

  } catch (error) {
    console.error(`❌ Backend request error:`, error);
    
    let errorMessage = 'Unknown error occurred';
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = 'Request timeout';
      } else {
        errorMessage = error.message;
      }
    }

    return {
      success: false,
      error: errorMessage,
      status: 500
    };
  }
}

/**
 * Helper functions for common HTTP methods
 */
export const backendApi = {
  get: <T = any>(endpoint: string, headers?: Record<string, string>) =>
    proxyBackendRequest<T>(endpoint, { method: 'GET', headers }),

  post: <T = any>(endpoint: string, body?: any, headers?: Record<string, string>) =>
    proxyBackendRequest<T>(endpoint, { method: 'POST', body, headers }),

  put: <T = any>(endpoint: string, body?: any, headers?: Record<string, string>) =>
    proxyBackendRequest<T>(endpoint, { method: 'PUT', body, headers }),

  delete: <T = any>(endpoint: string, headers?: Record<string, string>) =>
    proxyBackendRequest<T>(endpoint, { method: 'DELETE', headers }),

  patch: <T = any>(endpoint: string, body?: any, headers?: Record<string, string>) =>
    proxyBackendRequest<T>(endpoint, { method: 'PATCH', body, headers })
};
