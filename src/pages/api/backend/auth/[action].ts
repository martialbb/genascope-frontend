/**
 * Server-side API endpoint for authentication operations
 * Proxies requests to the backend using Kubernetes internal DNS
 */
import type { APIRoute } from 'astro';
import { backendApi } from '../../../../services/backendProxy.js';

export const GET: APIRoute = async ({ params, url }) => {
  try {
    const { action } = params;
    const searchParams = new URLSearchParams(url.search);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    let endpoint = `api/auth/${action}`;
    if (Object.keys(queryParams).length > 0) {
      const queryString = new URLSearchParams(queryParams).toString();
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
    console.error('Server API Error - GET /api/auth/*:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const POST: APIRoute = async ({ params, request }) => {
  try {
    const { action } = params;
    
    const contentType = request.headers.get('content-type');
    let body = null;
    
    if (contentType?.includes('application/json')) {
      body = await request.json();
    } else if (contentType?.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      body = Object.fromEntries(formData.entries());
    } else if (contentType?.includes('multipart/form-data')) {
      body = await request.formData();
    }

    const result = await backendApi.post(`api/auth/${action}`, body);

    if (!result.success) {
      return new Response(JSON.stringify({ error: result.error }), {
        status: result.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify(result.data), {
      status: result.status,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Server API Error - POST /api/auth/*:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
