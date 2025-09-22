/**
 * Server-side API endpoint for getting current user info
 * Proxies requests to the backend using Kubernetes internal DNS
 */
import type { APIRoute } from 'astro';
import { backendApi } from '../../../services/backendProxy.js';

export const GET: APIRoute = async ({ request }) => {
  try {
    // Extract Authorization header
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization header missing' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const result = await backendApi.get('api/auth/me', {
      'Authorization': authHeader
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
    console.error('Server API Error - GET /api/auth/me:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
