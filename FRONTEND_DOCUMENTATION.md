# Genascope Frontend Documentation

## Overview

The Genascope frontend is built using Astro.js with React components for interactive UI elements. It provides a comprehensive user interface for managing cancer risk assessment tools, patient management, user administration, invite system, lab test ordering, and account administration.

## Project Structure

The project follows a standard Astro.js project structure with additional organization for services and utilities:

```
src/
├── components/           # React components
│   ├── auth/            # Authentication related components
│   ├── admin/           # Administrative components
│   ├── dashboard/       # Dashboard and data display components
│   ├── forms/           # Form components
│   └── ui/              # Reusable UI components
├── context/             # React context providers
├── layouts/             # Astro layout templates
│   ├── AdminLayout.astro     # Admin interface layout
│   ├── SimpleLayout.astro    # Simple page layout
│   └── Layout.astro          # Main application layout
├── pages/               # Astro pages and routes
│   ├── admin/          # Administrative pages
│   │   ├── index.astro       # Admin dashboard
│   │   ├── edit-user/        # User editing interface
│   │   └── create-user.astro # User creation page
│   ├── api/            # API route handlers (if any)
│   ├── chat/           # Chat interface pages
│   ├── dashboard/      # Main dashboard pages
│   └── invite/         # Patient invite pages
├── services/           # API service layer
│   └── api.ts          # Main API service
├── styles/             # Global CSS styles
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## Key Features & Components

### Authentication System
- **JWT-based authentication** with localStorage token storage
- **Role-based access control** supporting admin, clinician, lab_tech, and patient roles
- **Automatic token validation** and user session management
- **Login/logout functionality** with proper state management

### User Management System
- **Complete CRUD operations** for user accounts
- **Edit User Interface** (`/admin/edit-user/[id]`) - Fixed import paths and form validation
- **Delete User Functionality** - Enhanced with proper cascade deletion for related records
- **Account ID management** - Resolved account_id mismatch issues for proper user permissions

### API Health Monitoring
- **Real-time API status checking** with visual indicators (✅ Available / ❌ Unavailable)
- **Fallback to mock data** when API endpoints are unavailable
- **Comprehensive endpoint monitoring** including invites, users, patients, and authentication services

### Patient Invite System
- **Invite generation and management** with unique token-based URLs
- **Email integration** for sending invites to patients
- **Invite status tracking** (pending, accepted, expired)
- **Bulk invite capabilities** for multiple patients

### Dashboard & Analytics
- **Patient overview dashboard** showing assessment status and actions
- **Clinician management interface** for viewing and managing assigned patients
- **Lab test ordering interface** with integration capabilities
- **Appointment scheduling** system with availability management

## API Service Architecture

The `apiService` in `src/services/api.ts` handles all communication with the backend API and includes:

### Core Features
- **Automatic token management** with Authorization headers
- **Error handling and retry logic** for failed requests
- **API health checking** with fallback mechanisms
- **Type-safe responses** using TypeScript interfaces

### Usage Examples

```typescript
import apiService from '../services/api';

// Authentication
await apiService.login(email, password);
const userInfo = await apiService.getCurrentUser();

// User Management
const users = await apiService.getUsers();
await apiService.editUser(userId, userData);
await apiService.deleteUser(userId);

// Patient Invites
const invites = await apiService.getInvites();
const invite = await apiService.generateInvite(patientData);

// Chat Interface
const chatSession = await apiService.startChat(sessionId);
await apiService.submitAnswer(sessionId, answer);

// Lab Tests
await apiService.orderLabTest(patientId, testData);
```

## Pages & Routes

### Public Pages
- `/` - Home/landing page with feature overview
- `/login` - User authentication page with role-based redirects

### Protected Pages (Require Authentication)
- `/dashboard` - Main dashboard (role-specific content)
- `/chat` - Interactive risk assessment chat interface
- `/invite/[token]` - Patient invite acceptance page

### Administrative Pages (Admin/Super Admin Only)
- `/admin` - Administrative dashboard with API health monitoring
- `/admin/create-user` - User creation interface
- `/admin/edit-user/[id]` - User editing interface (recently fixed import paths)

### Clinical Pages (Clinician/Admin Access)
- `/patients` - Patient management interface
- `/invites` - Invite generation and management
- `/lab-order` - Lab test ordering interface
- `/appointments` - Appointment scheduling system

## Recent Bug Fixes & Improvements (June 2025)

### User Management Fixes
1. **Edit User Functionality** - Resolved 403 Forbidden errors caused by account_id mismatches
2. **Delete User Operations** - Fixed foreign key constraint errors with proper cascade deletion
3. **Frontend Route Fixes** - Corrected import paths in admin pages

### API Integration Improvements
1. **Invites Endpoint** - Fixed "User not found" errors for invites with null clinician_id
2. **Health Check System** - Improved API monitoring with proper error handling
3. **Authentication Robustness** - Enhanced JWT token validation and user role management

### Technical Debt Resolution
1. **Import Path Corrections** - Fixed relative import issues in layout components
2. **Schema Validation** - Improved API response validation for null/undefined values
3. **Error Handling** - Enhanced error reporting and fallback mechanisms
- `/api/admin/create_account` - Create new accounts
- `/api/account/create_user` - Create users within an account
- `/api/generate_invite` - Generate patient invites
- `/api/labs/order_test` - Order lab tests
- `/api/labs/results/{order_id}` - Get lab test results
- `/api/patients` - Get patient list for dashboard
