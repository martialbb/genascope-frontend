// src/pages/api/start_chat.ts
import type { APIRoute } from 'astro';

// Mock data for the first question
const firstQuestion = {
  id: 1,
  text: "Welcome to Genascope! To start, could you please provide the patient's primary diagnosis?"
};

export const POST: APIRoute = async ({ request }) => {
  try {
    // Check if the request has a body
    if (!request.body) {
      console.error('API Error in /api/start_chat: Request has no body.');
      return new Response(JSON.stringify({ error: 'Request body is missing' }), {
        status: 400, // Bad Request
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Log the raw body text for debugging (optional, can be removed later)
    // const rawBody = await request.text();
    // console.log("Raw request body:", rawBody);
    // const body = JSON.parse(rawBody); // Parse manually if needed

    // Original parsing attempt
    const body = await request.json();
    const sessionId = body.sessionId;

    if (!sessionId) {
       console.error('API Error in /api/start_chat: sessionId is missing in request body.');
       return new Response(JSON.stringify({ error: 'sessionId is missing' }), {
         status: 400, // Bad Request
         headers: { 'Content-Type': 'application/json' }
       });
    }

    console.log(`API: Starting chat for session: ${sessionId}`);

    // In a real app, you would use the sessionId to initialize or retrieve chat state

    return new Response(JSON.stringify({ question: firstQuestion }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    // Log the specific error during JSON parsing
    if (error instanceof SyntaxError) {
      console.error('API Error in /api/start_chat: Failed to parse JSON body.', error);
    } else {
      console.error('API Error in /api/start_chat:', error);
    }
    return new Response(JSON.stringify({ error: 'Failed to start chat session' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};
