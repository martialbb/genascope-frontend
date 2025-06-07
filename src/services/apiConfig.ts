/**
 * API URL Utility
 * 
 * Provides a consistent way to get the backend API URL throughout the application,
 * with automatic detection for Docker environments.
 */

/**
 * Determine if we're running on the client side (browser)
 */
function isClientSide(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Get the backend API URL - adjusts automatically for Docker environments and client/server context
 * @returns The backend API base URL
 */
export function getApiBaseUrl(): string {
  try {
    // Client-side (browser) - always use localhost or current host
    if (isClientSide()) {
      // In browser, we can't access internal Docker hostnames
      // Use localhost for development or the current host for production
      const currentHost = window.location.host;
      if (currentHost.includes('localhost') || currentHost.includes('127.0.0.1')) {
        console.log('Client-side: Using localhost:8000 for local development');
        return 'http://localhost:8000';
      } else {
        // In production, assume the API is on the same host but port 8000
        // or use the protocol and host from the current page
        console.log(`Client-side: Using current host ${currentHost} for API`);
        return `${window.location.protocol}//${currentHost.split(':')[0]}:8000`;
      }
    }

    // Server-side - use environment variables
    const envUrl = import.meta.env.PUBLIC_API_URL;
    if (envUrl) {
      console.log(`Server-side: Using API URL from environment: ${envUrl}`);
      return envUrl;
    }

    // Check if we're in a Docker environment (server-side)
    const isDocker = import.meta.env.DOCKER_ENV === 'true';
    if (isDocker) {
      console.log('Server-side: Detected Docker environment, using backend:8000');
      return 'http://backend:8000';
    }

    // Default for local development (server-side)
    console.log('Server-side: Using default localhost:8000 API URL');
    return 'http://localhost:8000';
  } catch (error) {
    console.error('Error determining API URL:', error);
    // Fallback based on context
    if (isClientSide()) {
      return 'http://localhost:8000';
    }
    return 'http://backend:8000';
  }
}

/**
 * Create a full API endpoint URL
 * @param path The API endpoint path (without leading slash)
 * @returns The complete API URL
 */
export function getApiUrl(path: string): string {
  const baseUrl = getApiBaseUrl();
  // Ensure path doesn't start with a slash if baseUrl ends with one
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${baseUrl}/${cleanPath}`;
}
