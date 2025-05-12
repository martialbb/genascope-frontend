# Docker Configuration for Cancer Genix Frontend

This document outlines the Docker setup for the Cancer Genix Frontend application.

## Overview

The Docker configuration consists of:

1. **Dockerfile**: Multi-stage build optimized for production
2. **docker-compose.yml**: Production configuration with frontend, backend, and database
3. **docker-compose.dev.yml**: Development configuration with hot-reloading
4. **.dockerignore**: Files excluded from builds to optimize performance

## Docker Architecture

### Production Build

The `Dockerfile` uses a multi-stage build approach:

1. **base**: Node.js slim image as the foundation
2. **deps**: Installs npm dependencies
3. **builder**: Builds the Astro application
4. **runner**: Minimal production image with only necessary files

### Development Environment

The development setup mounts the local directory to enable hot-reloading:

- Local code changes are immediately reflected in the container
- Node modules are in a persistent volume for performance
- Backend and database services are included for a complete development environment

## Environment Variables

### Key Variables

| Variable | Description | Default Value |
|----------|-------------|---------------|
| PUBLIC_API_URL | Backend API URL | http://backend:8000 (prod), http://localhost:8000 (dev) |
| PUBLIC_BASE_URL | Frontend base URL | http://localhost:4321 |
| FRONTEND_PORT | Local port to expose frontend | 4321 |
| BACKEND_PORT | Local port to expose backend | 8000 |
| DATABASE_URI | Database connection string | mysql+pymysql://user:password@db/cancergenix |

### Configuration Files

- **.env.development**: Development environment variables
- **.env.production**: Production environment variables
- **.env**: Docker Compose environment variables

## Network Configuration

The services communicate through Docker's internal network:

- Frontend -> Backend: `http://backend:8000`
- Backend -> Database: `mysql+pymysql://user:password@db/cancergenix`

## Volume Management

Persistent volumes are used for:

- **mysql_data**: Database persistence
- **node_modules**: Development dependency cache

## Deployment Recommendations

1. **Production**: 
   - Use docker-compose.yml with proper environment variables
   - Set PUBLIC_API_URL to your actual backend URL
   - Consider using Docker Swarm or Kubernetes for scaling

2. **CI/CD Integration**:
   - Build images in CI pipeline
   - Tag with git commit hashes
   - Push to container registry before deployment

3. **Security Considerations**:
   - Use non-root user (already configured)
   - Keep images updated
   - Secure sensitive environment variables

4. **Performance Optimization**:
   - Configure appropriate resource limits
   - Use build caching
   - Consider CDN for static assets
