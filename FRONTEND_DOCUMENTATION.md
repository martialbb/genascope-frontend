# Genascope Frontend Documentation

## Overview

The Genascope frontend is built using Astro.js with React components for interactive UI elements. It provides a user interface for managing cancer risk assessment tools, patient management, lab test ordering, and account administration.

## Project Structure

The project follows a standard Astro.js project structure:

- `src/` - Source code directory
  - `components/` - React components
  - `context/` - React context providers
  - `layouts/` - Astro layout templates
  - `pages/` - Astro pages
  - `services/` - API service layer
  - `styles/` - Global CSS styles

## Key Components

### Authentication

The application uses a token-based authentication system implemented in `AuthContext.tsx`. It provides login, logout, and session management functionality.

```typescript
// Usage example
const { user, login, logout, loading } = useContext(AuthContext);
```

### API Service

The `apiService` in `src/services/api.ts` handles all communication with the backend API.

```typescript
// Example usage
import apiService from '../services/api';

// Login
await apiService.login(email, password);

// Start a chat session
const response = await apiService.startChat(sessionId);

// Generate a patient invite
const invite = await apiService.generateInvite(patientData);
```

## Main Features

### Chat Interface

The chat interface (`ChatComponent.tsx`) provides a conversational UI for cancer risk assessment. It connects to the backend chat API to ask questions and process user responses.

### Patient Management

Patients can be invited to take the assessment using the `GenerateInviteForm.tsx` component. This form generates unique invite links that can be shared with patients.

### Dashboard

The `DashboardTable.tsx` component provides clinicians with an overview of all patients, their assessment status, and actions they can take (order tests, view results, send invites).

### Lab Test Ordering

Clinicians can order genetic tests through the `OrderLabTestForm.tsx` component, which connects to lab integration APIs.

### Account Management

Administrator tools include:

- `CreateAccountForm.tsx` - For super admins to create new organizational accounts
- `CreateUserForm.tsx` - For account admins to create users within their organization

## Pages

- `/` - Home/landing page
- `/login` - User authentication page
- `/chat` - Chat-based assessment interface
- `/dashboard` - Patient management dashboard for clinicians
- `/invite` - Generate patient invite links
- `/lab-order` - Order lab tests
- `/admin/create-account` - Super admin account creation page
- `/admin/create-user` - Account admin user creation page

## Role-Based Access Control

The application supports different user roles:

- **super_admin**: Can create and manage organizational accounts
- **admin**: Can manage users within their organization
- **clinician/physician**: Can access patient data, send invites, order tests
- **user**: Regular user with limited access

## Development

### Environment Setup

To run the frontend locally:

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

### Docker Setup

For Docker-based development:

1. Build the image: `docker build -t cancer-genix-frontend .`
2. Start containers: `docker-compose -f docker-compose.dev.yml up`

## Integration with Backend

The frontend communicates with the backend through RESTful API endpoints:

- `/api/auth/token` - Authentication
- `/api/start_chat` - Start a chat session
- `/api/submit_answer` - Submit answers during chat
- `/api/eligibility/analyze` - Analyze eligibility based on responses
- `/api/admin/create_account` - Create new accounts
- `/api/account/create_user` - Create users within an account
- `/api/generate_invite` - Generate patient invites
- `/api/labs/order_test` - Order lab tests
- `/api/labs/results/{order_id}` - Get lab test results
- `/api/patients` - Get patient list for dashboard
