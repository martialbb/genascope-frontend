// src/pages/api/ai-chat/sessions.ts
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    // Extract Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ detail: 'Authorization header missing' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get request body
    const body = await request.json();

    // Forward to backend API
    const backendUrl = import.meta.env.BACKEND_URL || 'http://localhost:8000';
    const response = await fetch(`${backendUrl}/ai-chat/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('AI Chat Sessions API Error:', error);
    return new Response(JSON.stringify({ detail: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const GET: APIRoute = async ({ request, url }) => {
  try {
    // Extract Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ detail: 'Authorization header missing' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Forward query parameters
    const queryParams = url.searchParams.toString();
    const backendUrl = import.meta.env.BACKEND_URL || 'http://localhost:8000';
    const response = await fetch(`${backendUrl}/ai-chat/sessions?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader
      }
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('AI Chat Sessions GET API Error:', error);
    return new Response(JSON.stringify({ detail: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
