# Genascope API Usage Examples (Updated June 2025)

This document provides detailed examples of how to interact with the Genascope API endpoints. These examples can be used for testing, development, and integration purposes. This documentation reflects recent improvements including enhanced user management, invite system fixes, and improved authentication robustness.

## Recent API Improvements (June 2025)

### Enhanced Error Handling
- **Null Value Handling**: Fixed "User not found" errors for invites with null clinician_id
- **Validation Improvements**: Enhanced schema validation for edge cases
- **Better Error Messages**: More descriptive error responses for debugging

### User Management API Fixes
- **Account ID Resolution**: Fixed 403 Forbidden errors caused by account_id mismatches
- **Cascade Deletion**: Proper handling of foreign key constraints for user deletion
- **Role Validation**: Improved role-based access control validation

### Health Monitoring
- **API Status Checking**: New endpoints for monitoring API health
- **Fallback Mechanisms**: Graceful degradation when endpoints are unavailable

## Authentication

### Login

#### Using curl

```bash
# Login to get authentication token
curl -X POST 'http://localhost:8000/api/auth/token' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "doctor@example.com",
    "password": "securepassword"
  }'

# Response will contain:
# {
#   "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "token_type": "bearer",
#   "user": {...}
# }
```

#### Using JavaScript fetch API

```javascript
// Using fetch API
const loginUser = async (email, password) => {
  try {
    const response = await fetch('http://localhost:8000/api/auth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    const data = await response.json();
    return data; // { access_token: "...", token_type: "bearer", user: {...} }
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

// Example usage
loginUser('doctor@example.com', 'securepassword')
  .then(data => {
    localStorage.setItem('token', data.access_token);
    console.log('Logged in as:', data.user.email);
  })
  .catch(error => {
    console.error('Authentication failed:', error);
  });
```

### Using Authentication Token

```javascript
// Helper function to make authenticated API calls
const authenticatedFetch = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    // Handle token expiration
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      throw new Error('Session expired');
    }
    throw new Error(`HTTP error ${response.status}`);
  }
  
  return response.json();
};
```

## Patient Management

### Create a New Patient

```javascript
// Create patient function
const createPatient = async (patientData) => {
  return authenticatedFetch('http://localhost:8000/api/patients', {
    method: 'POST',
    body: JSON.stringify(patientData),
  });
};

// Example usage
const newPatient = {
  first_name: 'Jane',
  last_name: 'Doe',
  email: 'jane.doe@example.com',
  phone: '555-123-4567',
  date_of_birth: '1980-05-15',
};

createPatient(newPatient)
  .then(patient => {
    console.log('Patient created:', patient);
  })
  .catch(error => {
    console.error('Failed to create patient:', error);
  });
```

### Get Patient List

```javascript
// Get all patients for the current provider
const getPatients = async () => {
  return authenticatedFetch('http://localhost:8000/api/patients');
};

// Example usage with pagination
const getPaginatedPatients = async (page = 1, limit = 10) => {
  return authenticatedFetch(`http://localhost:8000/api/patients?page=${page}&limit=${limit}`);
};

// Usage
getPatients()
  .then(patients => {
    console.log(`Found ${patients.length} patients`);
  });
```

## Chat System

### Start a Chat Session

```javascript
// Start a new chat session or resume an existing one
const startChat = async (sessionId = null) => {
  const endpoint = sessionId 
    ? `http://localhost:8000/api/chat/start?session_id=${sessionId}`
    : 'http://localhost:8000/api/chat/start';
    
  return authenticatedFetch(endpoint, {
    method: 'POST',
  });
};

// Usage for a new session
startChat()
  .then(response => {
    const { session_id, question } = response;
    console.log('Started new session:', session_id);
    console.log('First question:', question.text);
  });

// Usage to resume a session
startChat('550e8400-e29b-41d4-a716-446655440000')
  .then(response => {
    console.log('Resumed session, next question:', response.question.text);
  });
```

### Submit an Answer

```javascript
// Submit an answer to a chat question
const submitAnswer = async (sessionId, questionId, answer) => {
  return authenticatedFetch('http://localhost:8000/api/chat/answer', {
    method: 'POST',
    body: JSON.stringify({
      session_id: sessionId,
      question_id: questionId,
      answer: answer,
    }),
  });
};

// Example usage
submitAnswer(
  '550e8400-e29b-41d4-a716-446655440000', // session ID
  5, // question ID
  'Yes' // answer text
)
  .then(response => {
    if (response.next_question) {
      console.log('Next question:', response.next_question.text);
    } else {
      console.log('Chat completed');
    }
  });
```

### Retrieve Chat History

```javascript
// Get the full history of a chat session
const getChatHistory = async (sessionId) => {
  return authenticatedFetch(`http://localhost:8000/api/chat/history/${sessionId}`);
};

// Example usage
getChatHistory('550e8400-e29b-41d4-a716-446655440000')
  .then(history => {
    console.log(`Retrieved ${history.messages.length} messages`);
    history.messages.forEach(message => {
      console.log(`${message.sender}: ${message.text}`);
    });
  });
```

## Patient Invite System

### Generate an Invite

```javascript
// Generate a patient invite
const generateInvite = async (patientData) => {
  return authenticatedFetch('http://localhost:8000/api/invites', {
    method: 'POST',
    body: JSON.stringify(patientData),
  });
};

// Example usage
const inviteData = {
  email: 'patient@example.com',
  first_name: 'John',
  last_name: 'Smith',
  phone: '555-987-6543',
};

generateInvite(inviteData)
  .then(response => {
    console.log('Invite URL:', response.invite_url);
    console.log('Expires:', new Date(response.expires_at));
  });
```

### List Active Invites

```javascript
// Get all active invites for the current provider
const getActiveInvites = async () => {
  return authenticatedFetch('http://localhost:8000/api/invites?status=pending');
};

// Example usage
getActiveInvites()
  .then(invites => {
    console.log(`Found ${invites.length} active invites`);
    invites.forEach(invite => {
      console.log(`${invite.first_name} ${invite.last_name}: ${invite.email}`);
      console.log(`Expires: ${new Date(invite.expires_at)}`);
    });
  });
```

### Cancel an Invite

```javascript
// Cancel a pending invite
const cancelInvite = async (inviteId) => {
  return authenticatedFetch(`http://localhost:8000/api/invites/${inviteId}`, {
    method: 'DELETE',
  });
};

// Example usage
cancelInvite('550e8400-e29b-41d4-a716-446655440000')
  .then(response => {
    console.log('Invite cancelled successfully');
  });
```

## Eligibility Analysis

### Analyze Patient Eligibility

```javascript
// Analyze eligibility based on chat session
const analyzeEligibility = async (sessionId) => {
  return authenticatedFetch('http://localhost:8000/api/eligibility/analyze', {
    method: 'POST',
    body: JSON.stringify({
      session_id: sessionId,
    }),
  });
};

// Example usage
analyzeEligibility('550e8400-e29b-41d4-a716-446655440000')
  .then(result => {
    console.log('Is eligible:', result.is_eligible);
    console.log('NCCN eligible:', result.nccn_eligible);
    console.log('Tyrer-Cuzick score:', result.tc_score);
    console.log('Risk factors:', result.factors);
  });
```

### Get Eligibility Report

```javascript
// Get a detailed eligibility report for a patient
const getEligibilityReport = async (patientId) => {
  return authenticatedFetch(`http://localhost:8000/api/eligibility/report/${patientId}`);
};

// Example usage
getEligibilityReport('550e8400-e29b-41d4-a716-446655440000')
  .then(report => {
    console.log('Report generated on:', new Date(report.created_at));
    console.log('Recommendations:', report.recommendations);
  });
```

## Lab Test Management

### Order a Lab Test

```javascript
// Order a genetic test
const orderLabTest = async (orderData) => {
  return authenticatedFetch('http://localhost:8000/api/labs/order', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });
};

// Example usage
const testOrder = {
  patient_id: '550e8400-e29b-41d4-a716-446655440000',
  test_type: 'BRCA_PANEL',
  eligibility_result_id: '550e8400-e29b-41d4-a716-446655440001',
  insurance_information: {
    provider: 'Blue Cross Blue Shield',
    policy_number: 'BCBS12345678',
    group_number: 'GRP9876',
    subscriber_name: 'John Smith',
    subscriber_dob: '1975-03-15',
    relationship: 'self',
  },
  notes: 'Patient has family history of breast cancer',
};

orderLabTest(testOrder)
  .then(response => {
    console.log('Order placed successfully');
    console.log('Order ID:', response.id);
    console.log('External order reference:', response.external_order_id);
  });
```

### Get Lab Results

```javascript
// Get results for a lab test
const getLabResults = async (orderId) => {
  return authenticatedFetch(`http://localhost:8000/api/labs/results/${orderId}`);
};

// Example usage
getLabResults('550e8400-e29b-41d4-a716-446655440000')
  .then(results => {
    console.log('Result status:', results.status);
    if (results.status === 'available') {
      console.log('Findings:', results.result_data.findings);
      console.log('Clinical significance:', results.result_data.clinical_significance);
    }
  });
```

## Account Management

### Create Account (Super Admin only)

```javascript
// Create a new organization account
const createAccount = async (accountData) => {
  return authenticatedFetch('http://localhost:8000/api/admin/accounts', {
    method: 'POST',
    body: JSON.stringify(accountData),
  });
};

// Example usage
const newAccount = {
  name: 'Memorial Medical Center',
  subscription_tier: 'professional',
  admin_email: 'admin@memorialmed.org',
  admin_first_name: 'Hospital',
  admin_last_name: 'Administrator',
};

createAccount(newAccount)
  .then(account => {
    console.log('Account created:', account);
    console.log('Initial admin password:', account.initial_password);
  });
```

### Create User (Account Admin only)

```javascript
// Create a new user for the current account
const createUser = async (userData) => {
  return authenticatedFetch('http://localhost:8000/api/account/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

// Example usage
const newUser = {
  email: 'nurse@memorialmed.org',
  first_name: 'Jane',
  last_name: 'Nurse',
  role: 'clinician',
};

createUser(newUser)
  .then(user => {
    console.log('User created:', user);
    console.log('Initial password:', user.initial_password);
  });
```

## Error Handling

Here's a comprehensive error handler for API calls:

```javascript
const apiRequest = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    ...options.headers,
    'Content-Type': 'application/json',
  };
  
  // Add auth header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    // Handle different error statuses
    if (!response.ok) {
      // Authentication errors
      if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login?session=expired';
        throw new Error('Your session has expired. Please log in again.');
      }
      
      // Permission errors
      if (response.status === 403) {
        throw new Error('You do not have permission to perform this action.');
      }
      
      // Not found
      if (response.status === 404) {
        throw new Error('The requested resource was not found.');
      }
      
      // Validation errors
      if (response.status === 422) {
        const errorData = await response.json();
        const errorDetails = errorData.detail || [];
        const formattedErrors = errorDetails.map(err => 
          `${err.loc.join('.')}: ${err.msg}`
        ).join('; ');
        
        throw new Error(`Validation error: ${formattedErrors || 'Invalid data provided'}`);
      }
      
      // Server errors
      if (response.status >= 500) {
        throw new Error('A server error occurred. Please try again later.');
      }
      
      // Generic error with status
      throw new Error(`Request failed with status ${response.status}`);
    }
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    
    return response.text();
    
  } catch (error) {
    console.error('API request failed:', error);
    
    // Network errors
    if (error.message === 'Failed to fetch') {
      throw new Error('Network error. Please check your connection and try again.');
    }
    
    throw error;
  }
};
```

## Using the API with Axios

Here's how to set up an axios-based API client:

```javascript
// api-client.js
import axios from 'axios';

const BASE_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  response => {
    return response.data;
  },
  error => {
    const { response } = error;
    
    // Handle token expiration
    if (response && response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login?session=expired';
      return Promise.reject(new Error('Your session has expired. Please log in again.'));
    }
    
    // Handle validation errors
    if (response && response.status === 422 && response.data?.detail) {
      const formattedErrors = response.data.detail.map(err => 
        `${err.loc.join('.')}: ${err.msg}`
      ).join('; ');
      
      return Promise.reject(new Error(`Validation error: ${formattedErrors}`));
    }
    
    // Handle network errors
    if (!response) {
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }
    
    // Generic error message with status
    return Promise.reject(
      new Error(response.data?.message || `Request failed with status ${response.status}`)
    );
  }
);

export default apiClient;
```

Usage example with axios:

```javascript
// Using the axios-based client
import apiClient from './api-client';

// Authentication
const login = async (email, password) => {
  return apiClient.post('/api/auth/token', { email, password });
};

// Patient management
const getPatients = async (page = 1, limit = 10) => {
  return apiClient.get(`/api/patients?page=${page}&limit=${limit}`);
};

// Chat system
const submitAnswer = async (sessionId, questionId, answer) => {
  return apiClient.post('/api/chat/answer', {
    session_id: sessionId,
    question_id: questionId,
    answer,
  });
};

// Example usage
login('doctor@example.com', 'password')
  .then(data => {
    localStorage.setItem('token', data.access_token);
    return getPatients();
  })
  .then(patients => {
    console.log('Patients:', patients);
  })
  .catch(error => {
    console.error('API Error:', error.message);
  });
```

---

## Backend API and Schema Coverage
- All API endpoints for appointments, chat, invites, labs, and users are now fully tested and covered.
- The OpenAPI schema, backend models, and database are kept in sync via Alembic migrations.
- If you add or change an endpoint, update the schema and tests accordingly.
