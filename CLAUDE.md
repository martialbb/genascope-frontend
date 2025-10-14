# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Genascope is a comprehensive web application for identifying individuals who may benefit from genetic testing for hereditary cancer syndromes. The frontend is built with React 19, TypeScript, Vite, and Ant Design, providing a modern user interface for:
- Interactive risk assessment via chat-based interface
- Patient invite management and tracking
- Appointment scheduling system
- Lab test ordering
- User and account administration with role-based access control

## Development Commands

### Core Development
```bash
# Start local development server
npm run dev                    # Runs on localhost:4321

# Build for production
npm run build                  # Runs TypeScript compiler + Vite build

# Type checking only (no build)
npm run type-check

# Preview production build
npm run preview

# Linting
npm run lint
```

### Testing
```bash
# Unit tests (Vitest)
npm run test:unit              # Run once
npm run test:unit:watch        # Watch mode

# End-to-end tests (Playwright)
npm run test:e2e
```

### Docker Development
```bash
# Start full-stack development environment
docker-compose -f docker-compose.dev.yml up --build

# Stop and clean up
docker-compose -f docker-compose.dev.yml down
```

### Deployment
The project uses GitHub Actions to automatically build and publish Docker images to GHCR on push to main. Images are published as:
- `ghcr.io/martialbb/genascope-frontend:latest`
- `ghcr.io/martialbb/genascope-frontend:<git-sha>`

To restart the Kubernetes deployment after a new image is published:
```bash
kubectl rollout restart deployment/genascope-frontend-dev -n dev
```

## Architecture Overview

### Frontend Stack
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 5.4
- **UI Library**: Ant Design 5.25 + Tailwind CSS
- **Routing**: React Router 6.22
- **State Management**: React Context (AuthContext) + local component state
- **HTTP Client**: Axios with centralized API service
- **Visualization**: @ant-design/charts and @ant-design/plots

### Key Architecture Patterns

#### API Communication
All backend communication goes through a centralized `ApiService` class (`src/services/api.ts`):
- Single Axios instance with auth token interceptor
- Automatic auth header injection from localStorage
- Cache-busting parameters to bypass Cloudflare caching
- Comprehensive methods for patients, invites, appointments, users, accounts, chat sessions
- Backend URL configured via `PUBLIC_API_URL` environment variable

#### Authentication Flow
- JWT-based authentication stored in localStorage (`authToken`, `authUser`)
- `AuthContext` (`src/contexts/AuthContext.tsx`) provides auth state globally
- `ProtectedRoute` component wraps routes requiring authentication
- `SidebarLayout` component handles navigation with role-based menu items

#### Role-Based Access Control
User roles with different permissions:
- **super_admin**: Can create/manage accounts, manage all users
- **admin**: Can manage users within their organization
- **clinician/physician**: Can access patients, send invites, order tests, manage appointments
- **patient**: Can schedule appointments, view their own data

Navigation links are dynamically generated in `SidebarLayout` based on user role.

#### Component Organization
```
src/
├── components/          # Reusable UI components
│   ├── chat/           # Chat wizard components (StepProgress, ChatWizard, etc.)
│   ├── *Form.tsx       # Form components (CreateUser, EditAccount, etc.)
│   ├── *Dashboard.tsx  # Dashboard views
│   ├── *List.tsx       # List/table components
│   └── SidebarLayout.tsx  # Main layout with navigation
├── pages/              # Route-level page components
│   ├── DashboardPage.tsx
│   ├── PatientsPage.tsx
│   ├── AppointmentsPage.tsx
│   ├── admin/          # Admin-specific pages
│   └── ...
├── services/           # API clients and backend communication
│   ├── api.ts          # Main ApiService class
│   ├── apiConfig.ts    # API URL configuration
│   └── chatConfigurationApi.ts
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication state
├── types/              # TypeScript type definitions
│   ├── patients.ts
│   ├── appointments.ts
│   └── chatConfiguration.ts
├── utils/              # Utility functions
│   ├── apiHealth.ts    # API health checking
│   └── auth.ts         # Auth helpers
└── tests/
    ├── unit/           # Unit tests (Vitest)
    ├── integration/    # Integration tests
    └── e2e/            # E2E tests (Playwright)
```

### Critical Implementation Details

#### TypeScript Path Aliases
The project uses `@/*` alias for `src/*` imports:
```typescript
import { apiService } from '@/services/api';
```
Configured in `tsconfig.json` and `vite.config.ts`.

#### Vite Proxy Configuration
In development, `/api` requests are proxied to `http://localhost:8000` (backend). This is configured in `vite.config.ts`:
```typescript
proxy: {
  '/api': {
    target: 'http://localhost:8000',
    changeOrigin: true
  }
}
```

#### Environment Variables
Required environment variables (see `.env.example`):
- `PUBLIC_API_URL`: Backend API URL (default: http://localhost:8000)
- `PUBLIC_BASE_URL`: Frontend base URL (default: http://localhost:3000)

Environment variables must be prefixed with `PUBLIC_` to be accessible in the client-side code.

#### API Request Debugging
The `ApiService` has extensive debug logging:
- Logs every request URL and auth token presence
- Logs response status and errors
- Adds cache-busting query parameters (`_cb`, `_v`)
- Adds cache-control headers to prevent stale data

#### Invite System
The invite system uses a transformation layer because backend and frontend use different field names:
- Backend: `invite_id`, `first_name`, `last_name`, etc.
- Frontend: `id`, `patient_name`, etc.
- Transformation happens in `transformInviteData()` method in ApiService

#### Appointment Scheduling
Supports:
- Patient self-scheduling after risk assessments
- Clinician availability management (recurring/one-time)
- Virtual and in-person appointment types
- Organization-wide appointment dashboard

### Testing Strategy

#### Unit Tests (Vitest + React Testing Library)
Located in `src/tests/unit/`. Test individual components in isolation with mocked dependencies.

#### Integration Tests
Located in `src/tests/integration/`. Test API integrations and multi-component interactions.

#### E2E Tests (Playwright)
Located in `src/tests/e2e/`. Test complete user flows:
- Login/authentication
- Chat workflows
- Admin account/user creation
- Appointment scheduling

### Docker & Deployment

#### Development Setup
Uses `docker-compose.dev.yml` with:
- Frontend (Vite dev server with hot-reload)
- Backend (FastAPI)
- PostgreSQL database
- MailDev (email testing)

Frontend runs on port 4321, backend on 8000.

#### Production Build
Multi-stage Dockerfile:
1. Build stage: Compile TypeScript and bundle with Vite
2. Production stage: Serve static files with nginx

The Docker image is multi-platform (linux/amd64, linux/arm64).

### Common Gotchas

1. **Auth Token Issues**: If API calls return 401, check that `authToken` exists in localStorage and is being sent in the Authorization header. Check browser console for "API Debug" logs.

2. **Invite Pagination**: The backend limits invite queries to 100 items per page. The `getInviteStatistics()` method handles pagination automatically to fetch all invites.

3. **User/Account Relationship**: Users belong to accounts via `account_id`. When editing users, ensure `account_id` is preserved or properly updated.

4. **Role-based Navigation**: Navigation links are filtered based on user role. If a link doesn't appear, check the `getNavLinks()` logic in `SidebarLayout.tsx`.

5. **Environment Variables**: Remember that environment variables must be prefixed with `PUBLIC_` to be accessible in client-side code with Vite.

6. **Cache Busting**: The API service adds cache-busting parameters to all requests. If you see stale data, the `_v` parameter can be incremented in `api.ts`.

### Backend Integration

This frontend connects to the [genascope-backend](https://github.com/martialbb/genascope-backend) FastAPI service. The backend provides:
- RESTful API endpoints for all resources
- JWT authentication
- PostgreSQL database with SQLAlchemy ORM
- AWS S3 integration for file storage
- Email notifications

API documentation is available at `http://localhost:8000/docs` when running the backend.
