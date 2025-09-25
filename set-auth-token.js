// Copy and paste this into the browser console to set the auth token
// Then refresh the page to test the API calls

const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbkB0ZXN0LmNvbSIsImlkIjoiOWJjYjIxOGQtYTk2My00ZWVjLWIxYzUtYmY5MWJiMDQwYWI4Iiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzU4ODUxNTc5fQ.kdYvg02Ulz4UYGyAqtuPRjau2_u4ZIQ8Xej1HCMnjx8';

localStorage.setItem('authToken', authToken);
console.log('✅ Auth token set in localStorage');
console.log('🔄 Please refresh the page to apply the authentication');

// Verify the token was stored
console.log('Token stored:', localStorage.getItem('authToken') ? '✅ Yes' : '❌ No');
