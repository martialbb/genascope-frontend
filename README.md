# CancerGenix

CancerGenix is a comprehensive web application designed to help identify individuals who may benefit from genetic testing for hereditary cancer syndromes. The platform consists of a chat-based risk assessment tool, eligibility analysis, and lab integration features.

## 🔄 Project Architecture

This project uses a multi-repository architecture:
- **Frontend** (this repo): User interface built with Astro, React (TypeScript), and Tailwind CSS
- **Backend**: [cancer-genix-backend](https://github.com/martialbb/cancer-genix-backend) - FastAPI backend service

## ✨ Key Features

- **Interactive Risk Assessment**: Chat-based interface for collecting cancer risk factors
- **Eligibility Analysis**: Algorithms to determine testing eligibility based on NCCN guidelines and Tyrer-Cuzick model
- **Patient Management**: Dashboard for clinicians to manage patients
- **Lab Integration**: Order genetic tests and view results
- **Account Management**: Tools for creating and managing organizational accounts and users
- **Role-Based Access Control**: Different permissions for different user roles

## 🚀 Project Setup

```sh
npm install
```

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command           | Action                                           |
| :---------------- | :----------------------------------------------- |
| `npm run dev`     | Starts local dev server at `localhost:4321`      |
| `npm run build`   | Build your production site to `./dist/`          |
| `npm run preview` | Preview your build locally, before deploying     |
| `npm run astro ...` | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI |

## 🔌 Backend Connection

This frontend is designed to work with the [cancer-genix-backend](https://github.com/martialbb/cancer-genix-backend) repository. To connect to the backend:

1. Create a `.env` file based on `.env.example`
2. Set `PUBLIC_API_URL` to point to your backend URL (default: http://localhost:8000)

For local development, both repositories should be cloned separately:

```sh
# Clone frontend (this repo)
git clone https://github.com/martialbb/cancer-genix-frontend.git

# Clone backend repo (in a separate directory)
git clone https://github.com/martialbb/cancer-genix-backend.git
```

## 🐳 Docker Support

This application can be run using Docker for consistent development and deployment environments.

### Setup Environment Variables

1. Create environment files for development and production:

```sh
# Create development environment variables
cat > .env.development << EOF
PUBLIC_API_URL=http://localhost:8000
PUBLIC_BASE_URL=http://localhost:4321
EOF

# Create production environment variables
cat > .env.production << EOF
PUBLIC_API_URL=http://backend:8000
PUBLIC_BASE_URL=http://localhost:4321
EOF

# Create a .env file for docker-compose environment variables
cat > .env << EOF
# Frontend configuration
FRONTEND_PORT=4321
PUBLIC_API_URL=http://backend:8000
PUBLIC_BASE_URL=http://localhost:4321

# Backend configuration (if using the backend container)
BACKEND_PORT=8000
BACKEND_IMAGE=ghcr.io/martialbb/cancer-genix-backend:latest
SECRET_KEY=replace_with_secure_key

# Database configuration
DB_PORT=3307
DB_USER=user
DB_PASSWORD=password
DB_ROOT_PASSWORD=rootpassword
DATABASE_URI=mysql+pymysql://user:password@db/cancergenix
EOF
```

### Using Docker for Development

The development setup provides hot-reloading for a seamless development experience:

```sh
# Start the development environment
docker-compose -f docker-compose.dev.yml up

# Start in detached mode
docker-compose -f docker-compose.dev.yml up -d

# Stop the development environment
docker-compose -f docker-compose.dev.yml down

# Stop and remove volumes
docker-compose -f docker-compose.dev.yml down -v
```

### Using Docker for Production

The production setup optimizes for performance and security:

```sh
# Build and start the production environment
docker-compose up -d --build

# Stop the production environment
docker-compose down

# View logs
docker-compose logs -f frontend

# View logs for all services
docker-compose logs -f
```

### Environment Variables in Docker

You can configure the application using environment variables:

1. **For development**: Values in `.env.development` and overrides in `docker-compose.dev.yml`
2. **For production**: Values in `.env.production` and overrides in `docker-compose.yml`
3. **For both**: Runtime variables in `.env` file or passed via command line

Override any variable at runtime:
```sh
PUBLIC_API_URL=http://api.example.com docker-compose up -d
```

### Building a Standalone Image

Build and run the frontend container without docker-compose:

```sh
# Build the Docker image
docker build -t cancer-genix-frontend:latest .

# Run the container
docker run -p 4321:4321 \
  -e PUBLIC_API_URL=http://your-backend-url \
  -e PUBLIC_BASE_URL=http://your-frontend-url \
  cancer-genix-frontend:latest
```

### Docker Health Checks

The production configuration includes health checks for monitoring container health status:

```sh
# View container health
docker ps

# Detailed health check info
docker inspect --format='{{json .State.Health}}' cancer-genix-frontend_frontend_1 | jq
```

## 📚 Documentation

For more detailed documentation, see:

- [Frontend Documentation](./FRONTEND_DOCUMENTATION.md) - Comprehensive guide to the frontend application
- [Backend Documentation](./backend/BACKEND_DOCUMENTATION.md) - Detailed backend API documentation
- [Patient Invite System](./backend/PATIENT_INVITE_DOCUMENTATION.md) - Documentation for the patient invitation flow
- [Docker Setup](./DOCKER.md) - Detailed Docker configuration documentation

## 👥 User Roles

The application supports several user roles with different permissions:

1. **Super Admin**: Can create and manage organizational accounts
2. **Admin**: Can manage users within their organization 
3. **Physician/Clinician**: Can access patient data, send invites, order tests
4. **User**: Regular user with limited access

## 🧪 Testing

```sh
# Run unit tests
npm run test

# Run end-to-end tests with Playwright
npm run test:e2e
```

## 📚 Documentation

For more detailed information, please refer to our [Documentation Guide](/DOCUMENTATION_GUIDE.md) which provides a complete overview of all available documentation, or explore specific sections:

- [Frontend Documentation](/FRONTEND_DOCUMENTATION.md): Detailed explanation of frontend components and services
- [Backend Documentation](/backend/BACKEND_DOCUMENTATION.md): API endpoints and backend services
- [Patient Invite System Documentation](/backend/PATIENT_INVITE_DOCUMENTATION.md): Patient invitation workflow
- [Architecture Diagrams](/docs/ARCHITECTURE_DIAGRAMS.md): Visual representation of system architecture
- [Database Schema](/docs/DATABASE_SCHEMA.md): Detailed database structure and relationships
- [API Usage Examples](/docs/API_USAGE_EXAMPLES.md): Code examples for API integration
- [Troubleshooting Guide](/docs/TROUBLESHOOTING_GUIDE.md): Solutions for common issues
- [Docker Setup](/DOCKER.md): Docker configuration and deployment
- [Repository Structure](/REPOSITORY-STRUCTURE.md): Project organization and development workflow

## 🛠️ Development Resources

- [Astro Documentation](https://docs.astro.build)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
