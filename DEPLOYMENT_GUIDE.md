# Local Deployment Guide

This project is now developed and tested locally using Docker Compose. All cloud deployment and Fly.io configuration has been removed.

## Local Development Overview

- All services (frontend, backend, database, maildev, minio) run locally via Docker Compose
- No cloud deployment or GitHub Actions workflows are required
- All configuration is managed via `.env.local` files

## Configuration Files

- `config/.env.example` – Template for frontend environment variables
- `config/.env.local` – Your local frontend config (not committed)
- `backend/.env.example` – Template for backend environment variables
- `backend/.env.local` – Your local backend config (not committed)
- `docker-compose.postgresql.dev.yml` – Local dev stack

## Local Setup Steps

1. Copy `.env.example` to `.env.local` and edit as needed
2. Copy `backend/.env.example` to `backend/.env.local` and edit as needed
3. Start all services:
   - `docker-compose -f docker-compose.postgresql.dev.yml up -d --build`

## Environment Variables

**Frontend (`.env.local`):**
```bash
PUBLIC_API_URL=http://localhost:8000
```

**Backend (`backend/.env.local`):**
```bash
BACKEND_ROLE_NAME=genascope-dev-backend-role
S3_BUCKET_NAME=genascope-dev-knowledge-sources
```

## Troubleshooting

- Ensure all services are running with Docker Compose
- Check `.env.local` files for correct values
- See `ENVIRONMENT_SETUP.md` for more help
     - `BACKEND_URL` - Your backend URL for that environment
