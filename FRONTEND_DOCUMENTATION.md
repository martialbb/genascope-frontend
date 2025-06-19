# Genascope Frontend Documentation

## Overview

The Genascope frontend is built using Astro.js with React components for interactive UI elements. It provides a comprehensive user interface for managing cancer risk assessment tools, patient management, user administration, invite system, lab test ordering, and account administration.

The frontend integrates with a FastAPI backend that uses AWS S3 for secure file storage via IAM role assumption, following the principle of least privilege for enhanced security.

## Project Structure

The project follows a standard Astro.js project structure with additional organization for services and utilities. Recent cleanup efforts have streamlined components and moved test scripts to appropriate locations:

```
src/
├── components/           # React components (cleaned up duplicates)
│   ├── auth/            # Authentication related components
│   ├── admin/           # Administrative components
│   ├── dashboard/       # Dashboard and data display components
│   ├── forms/           # Form components
│   ├── ui/              # Reusable UI components
│   └── ChatConfigurationManager.tsx  # Main chat config component (consolidated)
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

backend/scripts/         # Test and utility scripts (moved from root)
├── create_test_invites.py  # Backend test data creation
├── upload_test_file.py     # S3 upload testing
└── test_s3_access.py       # S3 role assumption testing
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

### Security & Infrastructure Enhancements (December 2024)
1. **AWS IAM Role-Based Authentication** - Implemented least-privilege access with temporary credentials
2. **S3 Integration Security** - Added TLS enforcement and secure file upload handling
3. **Backend Role Assumption** - Updated backend to use STS role assumption instead of long-term access keys
4. **Regional STS Endpoint** - Configured regional STS endpoint for improved reliability

### Infrastructure as Code (IaC)
1. **Terraform/OpenTofu Modules** - Created security module for IAM roles, policies, and S3 bucket configuration
2. **Deterministic S3 Bucket Naming** - Removed random suffixes for consistent infrastructure provisioning
3. **Least Privilege Policies** - Implemented granular IAM policies for S3, CloudWatch, SES, and Secrets Manager access
4. **Environment Configuration** - Standardized environment variable management across frontend and backend

### User Management Fixes
1. **Edit User Functionality** - Resolved 403 Forbidden errors caused by account_id mismatches
2. **Delete User Operations** - Fixed foreign key constraint errors with proper cascade deletion
3. **Frontend Route Fixes** - Corrected import paths in admin pages

### API Integration Improvements
1. **Invites Endpoint** - Fixed "User not found" errors for invites with null clinician_id
2. **Health Check System** - Improved API monitoring with proper error handling
3. **Authentication Robustness** - Enhanced JWT token validation and user role management
4. **File Upload Security** - Secured file uploads with role-based S3 access and TLS encryption

### Technical Debt Resolution & Cleanup
1. **Component Consolidation** - Removed duplicate ChatConfigurationManager components (Old/New variants)
2. **Script Organization** - Moved test scripts from frontend root to `backend/scripts/` directory
3. **Untracked File Cleanup** - Removed stray Python and text files from frontend project
4. **Import Path Corrections** - Fixed relative import issues in layout components
5. **Schema Validation** - Improved API response validation for null/undefined values
6. **Error Handling** - Enhanced error reporting and fallback mechanisms

### Development Environment Improvements
1. **Docker Configuration** - Updated docker-compose to use proper environment file locations
2. **AWS CLI Configuration** - Set default region and credentials for development consistency
3. **Environment Variable Management** - Consolidated and standardized env file usage across services
4. **Container Health Monitoring** - Improved logging and debugging capabilities
### Backend API Endpoints

The backend provides RESTful API endpoints with secure file handling:

#### Authentication & Users
- `/api/auth/login` - User authentication with JWT tokens
- `/api/auth/me` - Get current user information
- `/api/users` - User management operations
- `/api/admin/create_account` - Create new accounts
- `/api/account/create_user` - Create users within an account

#### Patient Management & Invites
- `/api/generate_invite` - Generate patient invites
- `/api/invites` - Manage patient invitations
- `/api/patients` - Get patient list for dashboard

#### Lab Services
- `/api/labs/order_test` - Order lab tests
- `/api/labs/results/{order_id}` - Get lab test results

#### File Upload & Storage (S3 Integration)
- `/api/upload` - Secure file upload to S3 with role-based access
  - Requires JWT authentication
  - Uses temporary AWS credentials via STS role assumption
  - Enforces TLS encryption for all S3 operations
  - Returns S3 object key and metadata

#### Health & Monitoring
- `/api/health` - API health check endpoint
- `/api/docs` - Interactive API documentation (Swagger/OpenAPI)

## Backend Integration & Security Architecture

### AWS S3 Integration
The backend now uses AWS S3 for secure file storage with the following security features:
- **IAM Role-Based Access**: Backend assumes an IAM role (`genascope-dev-backend-role`) for S3 access
- **Temporary Credentials**: Uses AWS STS to obtain temporary credentials instead of long-term access keys
- **Least Privilege Policies**: Granular permissions for S3, CloudWatch, SES, and Secrets Manager
- **TLS Enforcement**: S3 bucket policy enforces HTTPS/TLS connections for all requests
- **Regional STS Endpoint**: Uses regional STS endpoint (`us-west-2`) for reliable role assumption

### Infrastructure as Code (IaC)
The project includes Terraform/OpenTofu modules for provisioning AWS infrastructure:

```
iac/
├── environments/
│   └── dev/
│       ├── main.tf          # Environment-specific configuration
│       └── outputs.tf       # Environment outputs
└── modules/
    └── security/
        ├── main.tf          # IAM roles, policies, and S3 bucket
        ├── variables.tf     # Module variables
        └── outputs.tf       # Module outputs
```

Key infrastructure components:
- **S3 Bucket**: `genascope-dev-knowledge-sources` with versioning and encryption
- **IAM Role**: Backend service role with assume role capability
- **IAM Policies**: Least-privilege policies for required AWS services
- **Bucket Policy**: TLS enforcement and access control

### Environment Configuration
Standardized environment variable management across services:

**Frontend (`.env.local`)**:
```bash
PUBLIC_API_URL=http://localhost:8000
AWS_DEFAULT_REGION=us-west-2
AWS_ACCESS_KEY_ID=<initial-credentials>
AWS_SECRET_ACCESS_KEY=<initial-credentials>
```

**Backend (`backend/.env.local`)**:
```bash
AWS_DEFAULT_REGION=us-west-2
AWS_ACCESS_KEY_ID=<initial-credentials>
AWS_SECRET_ACCESS_KEY=<initial-credentials>
S3_BUCKET_NAME=genascope-dev-knowledge-sources
BACKEND_ROLE_NAME=genascope-dev-backend-role
```

### Security Best Practices
1. **No Long-Term Credentials in Production**: Backend uses role assumption for AWS access
2. **TLS Everywhere**: All S3 communications encrypted in transit
3. **Principle of Least Privilege**: IAM policies grant minimum required permissions
4. **Environment Separation**: Different IAM roles and S3 buckets per environment
5. **Audit Trail**: CloudWatch logging for all backend operations

### File Upload Flow
1. Frontend sends file upload request with JWT authentication
2. Backend validates user permissions and JWT token
3. Backend assumes IAM role using STS for temporary AWS credentials
4. Backend uploads file to S3 using temporary credentials over TLS
5. Backend stores file metadata in database with S3 object key
6. Frontend receives upload confirmation and file reference

## Development & Testing Tools

### Test Scripts
The project includes several testing utilities located in `backend/scripts/`:

**S3 and AWS Integration Testing**:
- `test_s3_access.py` - Tests AWS role assumption and S3 access
- `upload_test_file.py` - Tests file upload functionality with authentication
- `create_test_invites.py` - Creates test data for invite system testing

**Usage Examples**:
```bash
# Test S3 role assumption and access
cd backend && python scripts/test_s3_access.py

# Test file upload with authentication
cd backend && python scripts/upload_test_file.py

# Create test invite data
cd backend && python scripts/create_test_invites.py
```

### Environment Verification
**Docker Container Testing**:
```bash
# Check backend environment variables
docker exec -it genascope-frontend-backend-1 printenv | grep -E "(AWS|S3|ROLE)"

# Test backend file uploads
curl -X POST "http://localhost:8000/api/upload" \
  -H "Authorization: Bearer <jwt-token>" \
  -F "file=@test-file.txt"

# Check S3 bucket contents
aws s3 ls s3://genascope-dev-knowledge-sources/
```

**Infrastructure Verification**:
```bash
# Verify IAM role and policies
aws iam get-role --role-name genascope-dev-backend-role
aws iam list-attached-role-policies --role-name genascope-dev-backend-role

# Test role assumption
aws sts assume-role --role-arn "arn:aws:iam::ACCOUNT:role/genascope-dev-backend-role" \
  --role-session-name "test-session"

# Check S3 bucket policy
aws s3api get-bucket-policy --bucket genascope-dev-knowledge-sources
```

### Frontend Testing
**Component Testing**:
```bash
# Run unit tests
npm run test

# Run end-to-end tests
npm run test:e2e

# Test API health monitoring
# Visit http://localhost:4321/admin to see API status indicators
```

**Browser Testing**:
- API health indicators show real-time backend connectivity
- File upload components handle S3 integration seamlessly
- Role-based access control prevents unauthorized operations
- Responsive design works across mobile and desktop devices

### Development Workflow
1. **Infrastructure Setup**: Use OpenTofu/Terraform to provision AWS resources
2. **Environment Configuration**: Set up `.env.local` files for both frontend and backend
3. **Docker Development**: Use `docker-compose.postgresql.dev.yml` for local development
4. **Backend Testing**: Verify S3 access and role assumption with test scripts
5. **Frontend Testing**: Test API integration and user workflows
6. **Security Validation**: Confirm TLS enforcement and least-privilege access
