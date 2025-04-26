// src/pages/api/patients.ts
import type { APIRoute } from 'astro';

// Mock patient data
const mockPatients = [
  { id: 'p001', name: 'John Doe', status: 'Chat Completed', lastActivity: '2025-04-24' },
  { id: 'p002', name: 'Jane Smith', status: 'Results Ready', lastActivity: '2025-04-23' },
  { id: 'p003', name: 'Alice Brown', status: 'Chat In Progress', lastActivity: '2025-04-25' },
  { id: 'p004', name: 'Bob White', status: 'Pending Invite', lastActivity: '2025-04-22' },
];

export const GET: APIRoute = async () => {
  console.log("API: Fetching patients");
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 200));

  return new Response(JSON.stringify(mockPatients), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
};
