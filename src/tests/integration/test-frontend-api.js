// Test frontend API integration
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbkB0ZXN0aG9zcGl0YWwuY29tIiwiaWQiOiJhZG1pbi0wMDEiLCJyb2xlIjoiYWRtaW4iLCJleHAiOjE3NDg4MTUzMTF9.wt47RDsXtdxNcTFXUQjrof8wa5yopf0_5ImoSsn2D-k';

// Test the frontend API endpoint to see if transformation is working
async function testFrontendAPI() {
  try {
    console.log('Testing frontend API with auth token...');
    
    const response = await fetch('http://localhost:8000/api/invites', {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Backend API Response:', JSON.stringify(data, null, 2));
      
      // Simulate the transformation that our frontend API service does
      const transformedInvites = data.invites.map(invite => ({
        id: invite.invite_id,
        patient_id: invite.email,
        patient_name: `${(invite.first_name || '').trim()} ${(invite.last_name || '').trim()}`.trim(),
        patient_email: invite.email,
        provider_id: invite.provider_id,
        provider_name: invite.provider_name,
        status: invite.status,
        invite_url: invite.invite_url,
        expires_at: invite.expires_at,
        created_at: invite.created_at,
        updated_at: invite.updated_at || invite.created_at,
        custom_message: invite.custom_message,
        email_sent: true
      }));
      
      console.log('\nTransformed Frontend Data:');
      transformedInvites.forEach((invite, index) => {
        console.log(`${index + 1}. ${invite.patient_name} (${invite.patient_email}) - ${invite.status}`);
      });
      
    } else {
      console.error('API request failed:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testFrontendAPI();
