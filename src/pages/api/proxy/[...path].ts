/**
 * Single API proxy endpoint for all backend requests
 * Handles all requests to /api/proxy/* and forwards them to the backend
 */
import type { APIRoute } from 'astro';
import { backendApi } from '../../../services/backendProxy';

export const GET: APIRoute = async ({ params, url }) => {
  try {
    // Extract the path after /api/proxy/
    const backendPath = params.path || '';
    const searchParams = new URLSearchParams(url.search);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    let apiPath = backendPath;
    if (Object.keys(queryParams).length > 0) {
      const queryString = new URLSearchParams(queryParams).toString();
      apiPath += `?${queryString}`;
    }

    console.log(`🔄 Proxying GET request to backend: ${apiPath}`);
    const result = await backendApi.get(apiPath);

    if (!result.success) {
      console.error(`❌ Backend GET request failed: ${result.error}`);
      return new Response(JSON.stringify({ error: result.error }), {
        status: result.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log(`✅ Backend GET request successful`);
    return new Response(JSON.stringify(result.data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Server API Error - GET proxy:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const POST: APIRoute = async ({ params, request }) => {
  try {
    const backendPath = params.path || '';
    let body = null;
    
    const contentType = request.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      body = await request.json();
    } else if (contentType?.includes('multipart/form-data')) {
      body = await request.formData();
    }

    console.log(`🔄 Proxying POST request to backend: ${backendPath}`);
    const result = await backendApi.post(backendPath, body);

    if (!result.success) {
      console.error(`❌ Backend POST request failed: ${result.error}`);
      return new Response(JSON.stringify({ error: result.error }), {
        status: result.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log(`✅ Backend POST request successful`);
    return new Response(JSON.stringify(result.data), {
      status: result.status,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Server API Error - POST proxy:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const backendPath = params.path || '';
    const body = await request.json();

    console.log(`🔄 Proxying PUT request to backend: ${backendPath}`);
    const result = await backendApi.put(backendPath, body);

    if (!result.success) {
      console.error(`❌ Backend PUT request failed: ${result.error}`);
      return new Response(JSON.stringify({ error: result.error }), {
        status: result.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log(`✅ Backend PUT request successful`);
    return new Response(JSON.stringify(result.data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Server API Error - PUT proxy:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const backendPath = params.path || '';

    console.log(`🔄 Proxying DELETE request to backend: ${backendPath}`);
    const result = await backendApi.delete(backendPath);

    if (!result.success) {
      console.error(`❌ Backend DELETE request failed: ${result.error}`);
      return new Response(JSON.stringify({ error: result.error }), {
        status: result.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log(`✅ Backend DELETE request successful`);
    return new Response(null, {
      status: 204
    });

  } catch (error) {
    console.error('Server API Error - DELETE proxy:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
