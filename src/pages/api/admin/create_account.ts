// src/pages/api/admin/create_account.ts
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { accountName, adminEmail } = body;

    if (!accountName || !adminEmail) {
      return new Response(JSON.stringify({ error: 'Account name and admin email are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log(`API: Creating account: ${accountName} with admin: ${adminEmail}`);

    // Simulate network delay and processing
    await new Promise(resolve => setTimeout(resolve, 600));

    // In a real app, create account and admin user in the database
    const newAccountId = `acc_${Date.now()}`;

    return new Response(JSON.stringify({
      message: `Account "${accountName}" created successfully.`,
      accountId: newAccountId
    }), {
      status: 201, // 201 Created
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('API Error in /api/admin/create_account:', error);
    return new Response(JSON.stringify({ error: 'Failed to create account' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};
