// Test script to verify API transformation
const mockBackendResponse = {
  "invites": [
    {
      "email": "mikeblok@test.com",
      "first_name": "Michael ",
      "last_name": "Bloom",
      "phone": "2232223333",
      "invite_id": "315351cb-fdf1-4d73-aee8-2fa96d5bda1f",
      "invite_url": "http://localhost:4321/invite/78f715f8-5ee4-4eab-8ea1-e8215c9e867c",
      "provider_id": "test-clinician-1",
      "provider_name": "Dr. Test Clinician",
      "status": "pending",
      "created_at": "2025-05-31T08:44:15",
      "expires_at": "2025-06-14T20:46:19",
      "accepted_at": null
    }
  ],
  "total_count": 5,
  "page": 1,
  "limit": 10,
  "total_pages": 1,
  "has_next": false,
  "has_prev": false
};

// Simulate the transformation function
function transformInviteData(backendInvite) {
  return {
    id: backendInvite.invite_id,
    patient_id: backendInvite.email,
    patient_name: `${backendInvite.first_name || ''} ${backendInvite.last_name || ''}`.trim(),
    patient_email: backendInvite.email,
    provider_id: backendInvite.provider_id,
    provider_name: backendInvite.provider_name,
    status: backendInvite.status,
    invite_url: backendInvite.invite_url,
    expires_at: backendInvite.expires_at,
    created_at: backendInvite.created_at,
    updated_at: backendInvite.updated_at || backendInvite.created_at,
    custom_message: backendInvite.custom_message,
    email_sent: true
  };
}

// Transform and show result
const transformedInvite = transformInviteData(mockBackendResponse.invites[0]);
console.log('Backend data:', mockBackendResponse.invites[0]);
console.log('Transformed data:', transformedInvite);
console.log('Patient name:', transformedInvite.patient_name);
