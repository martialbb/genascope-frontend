// Astro middleware for Cloudflare cache optimization
import type { MiddlewareNext } from 'astro';
import type { APIContext } from 'astro';

export async function onRequest(context: APIContext, next: MiddlewareNext) {
  const response = await next();
  
  // Skip if not a successful response
  if (!response.ok) return response;
  
  const url = new URL(context.request.url);
  const pathname = url.pathname;
  
  // Set cache headers based on content type and path
  const headers = new Headers(response.headers);
  
  // Static assets - long cache
  if (pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    headers.set('CF-Cache-Status', 'CACHE');
  }
  // API routes - no cache
  else if (pathname.startsWith('/api/')) {
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    headers.set('CF-Cache-Status', 'BYPASS');
  }
  // Dashboard and patient pages - short cache with stale-while-revalidate
  else if (pathname.match(/^\/(dashboard|patients|appointments|manage-)/)) {
    headers.set('Cache-Control', 'public, max-age=300, s-maxage=300, stale-while-revalidate=86400');
    headers.set('CF-Cache-Status', 'DYNAMIC');
  }
  // Static pages - medium cache
  else {
    headers.set('Cache-Control', 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400');
    headers.set('CF-Cache-Status', 'CACHE');
  }
  
  // Performance headers
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('X-XSS-Protection', '1; mode=block');
  
  // Prefetch important resources for dashboard performance
  if (pathname === '/dashboard') {
    headers.set('Link', '</api/backend/api/patients?limit=10>; rel=preload; as=fetch; crossorigin, </api/backend/api/invites?limit=100&page=1>; rel=preload; as=fetch; crossorigin');
  }
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
