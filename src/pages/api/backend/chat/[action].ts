/**
 * Server-side API endpoint for chat sessions
 * Proxies requests to the backend using Kubernetes internal DNS
 */
import type { APIRoute } from 'astro';
import { backendApi } from '../../../../services/backendProxy';

export const POST: APIRoute = async ({ request }) => {
  try {
    // Parse the request URL to determine the specific chat endpoint
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    
    // Extract the action from the path (e.g., 'session', 'start', 'answer', 'analyze')
    const action = pathSegments[pathSegments.length - 1];
    
    let endpoint = '';
    let body = null;
    
    if (request.headers.get('content-type')?.includes('application/json')) {
      body = await request.json();
    }

    switch (action) {
      case 'session':
        endpoint = 'api/chat/session';
        break;
      case 'start':
        endpoint = 'api/chat/start';
        break;
      case 'answer':
        endpoint = 'api/chat/answer';
        break;
      case 'analyze':
        endpoint = 'api/chat/analyze';
        break;
      default:
        return new Response(JSON.stringify({ error: 'Invalid chat action' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
    }

    const result = await backendApi.post(endpoint, body);

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
    console.error('Server API Error - POST /api/chat/*:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
