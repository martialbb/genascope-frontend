/**
 * Proxy endpoint for invite statistics
 * Aggregates invite counts by status for better performance
 */
import type { APIRoute } from 'astro';
import { backendApi } from '../../../../../services/backendProxy.js';

export const GET: APIRoute = async ({ request }) => {
  try {
    // Extract Authorization header from the incoming request
    const authHeader = request.headers.get('Authorization');
    const headers: Record<string, string> = {};
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    console.log('🔄 Fetching invite statistics...');
    
    // Try to get statistics from backend (if endpoint exists)
    try {
      const result = await backendApi.get('api/invites/statistics', headers);
      
      if (result.success) {
        return new Response(JSON.stringify(result.data), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } catch (error) {
      console.log('📊 Statistics endpoint not available, calculating from individual calls');
    }

    // Fallback: Make parallel requests for each status to get counts
    const [pendingRes, completedRes, expiredRes, cancelledRes] = await Promise.all([
      backendApi.get('api/invites?status=pending&limit=1', headers),
      backendApi.get('api/invites?status=completed&limit=1', headers),
      backendApi.get('api/invites?status=expired&limit=1', headers),
      backendApi.get('api/invites?status=cancelled&limit=1', headers)
    ]);

    // Check if all requests were successful
    if (!pendingRes.success || !completedRes.success || !expiredRes.success || !cancelledRes.success) {
      const failedRequest = [pendingRes, completedRes, expiredRes, cancelledRes].find(res => !res.success);
      return new Response(JSON.stringify({ error: failedRequest?.error || 'Failed to fetch statistics' }), {
        status: failedRequest?.status || 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Calculate statistics from the responses
    const statistics = {
      pending: pendingRes.data.total_count || 0,
      completed: completedRes.data.total_count || 0,
      expired: expiredRes.data.total_count || 0,
      cancelled: cancelledRes.data.total_count || 0,
      total: (pendingRes.data.total_count || 0) + 
             (completedRes.data.total_count || 0) + 
             (expiredRes.data.total_count || 0) + 
             (cancelledRes.data.total_count || 0)
    };

    console.log('📊 Calculated invite statistics:', statistics);

    return new Response(JSON.stringify(statistics), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Server API Error - invite statistics:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
