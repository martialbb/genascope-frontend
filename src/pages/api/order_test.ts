// src/pages/api/order_test.ts
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { patientId } = body;

    if (!patientId) {
      return new Response(JSON.stringify({ error: 'Patient ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log(`API: Ordering test for patient: ${patientId}`);

    // Simulate network delay and processing
    await new Promise(resolve => setTimeout(resolve, 500));

    // In a real app, interact with an ordering system

    return new Response(JSON.stringify({ message: `Test ordered successfully for patient ${patientId}` }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error("API Error in /api/order_test:", error);
    return new Response(JSON.stringify({ error: 'Failed to order test' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};
