/**
 * Server-side API endpoint for patient management
 * Proxies requests to the backend using Kubernetes internal DNS
 */
import type { APIRoute } from 'astro';
import { backendApi } from '../../../services/backendProxy.js';

export const GET: APIRoute = async ({ request, url }) => {
  try {
    // Extract query parameters for filtering/pagination
    const searchParams = new URLSearchParams(url.search);
    const params = Object.fromEntries(searchParams.entries());
    
    // Add query parameters to the endpoint if they exist
    let endpoint = 'api/patients/';
    if (Object.keys(params).length > 0) {
      const queryString = new URLSearchParams(params).toString();
      endpoint += `?${queryString}`;
    }

    const result = await backendApi.get(endpoint);

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
    console.error('Server API Error - GET /api/patients:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const result = await backendApi.post('api/patients/', body);

    if (!result.success) {
      return new Response(JSON.stringify({ error: result.error }), {
        status: result.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify(result.data), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Server API Error - POST /api/patients:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
