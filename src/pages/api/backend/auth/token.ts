/**
 * Server-side API endpoint for authentication
 * Proxies requests to the backend using Kubernetes internal DNS
 */
import type { APIRoute } from 'astro';
import { backendApi } from '../../../../services/backendProxy.js';

export const POST: APIRoute = async ({ request }) => {
  try {
    const contentType = request.headers.get('content-type');
    let body = null;
    
    console.log('🔐 Auth token request - Content-Type:', contentType);
    
    if (contentType?.includes('application/json')) {
      body = await request.json();
      console.log('🔐 Parsed JSON body:', body);
    } else if (contentType?.includes('application/x-www-form-urlencoded')) {
      const formText = await request.text();
      console.log('🔐 Raw form data:', formText);
      
      // Parse URL-encoded form data manually
      const params = new URLSearchParams(formText);
      body = Object.fromEntries(params.entries());
      console.log('🔐 Parsed form body:', body);
    } else if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData();
      body = Object.fromEntries(formData.entries());
      console.log('🔐 Parsed multipart body:', body);
    }

    // Forward the request to backend with proper content type
    const result = await backendApi.post('api/auth/token', body, {
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    if (!result.success) {
      return new Response(JSON.stringify({ error: result.error }), {
        status: result.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify(result.data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Server API Error - POST /api/auth/token:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
