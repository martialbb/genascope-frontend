// src/pages/api/account/create_user.ts
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    // Assuming the request includes accountId to associate the user
    const { accountId, userName, userEmail, userRole } = body;

    if (!accountId || !userName || !userEmail || !userRole) {
      return new Response(JSON.stringify({ error: 'Account ID, user name, email, and role are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log(`API: Creating user for account ${accountId}: Name=${userName}, Email=${userEmail}, Role=${userRole}`);

    // Simulate network delay and processing
    await new Promise(resolve => setTimeout(resolve, 400));

    // In a real app, create the user in the database, associated with the account
    const newUserId = `user_${Date.now()}`;

    return new Response(JSON.stringify({
      message: `User "${userName}" created successfully for account ${accountId}.`,
      userId: newUserId
    }), {
      status: 201, // 201 Created
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error("API Error in /api/account/create_user:", error);
    return new Response(JSON.stringify({ error: 'Failed to create user' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};
