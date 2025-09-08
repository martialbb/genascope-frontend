/**
 * Runtime Configuration API Endpoint
 * This endpoint provides the backend URL at runtime, not build time
 */

export async function GET() {
  // Get the backend URL from runtime environment variables
  const backendUrl = process.env.PUBLIC_API_URL || process.env.BACKEND_URL || 'http://localhost:8000';
  
  const config = {
    backendUrl,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  };

  return new Response(JSON.stringify(config), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  });
}
