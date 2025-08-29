# Local Environment Configuration Guide

This project no longer uses Fly.io or cloud deployment. All development and testing is now performed locally using Docker Compose and local environment files.

## Local Development Setup

1. **Clone the repository**
2. **Copy environment templates:**
   - `cp .env.example .env.local`
   - `cp backend/.env.example backend/.env.local`
3. **Edit `.env.local` and `backend/.env.local`** to set your local configuration (see `ENVIRONMENT_SETUP.md` for details).
4. **Start all services locally:**
   - `docker-compose -f docker-compose.postgresql.dev.yml up -d --build`

## Environment Variables

All configuration is now managed via local `.env.local` files for both frontend and backend. Example:

**Frontend (`.env.local`):**
```bash
PUBLIC_API_URL=http://localhost:8000
```

**Backend (`backend/.env.local`):**
```bash
BACKEND_ROLE_NAME=genascope-dev-backend-role
S3_BUCKET_NAME=genascope-dev-knowledge-sources
```

See `ENVIRONMENT_SETUP.md` for full details on environment variables and security best practices.

## Security Best Practices

- Never commit secrets to Git
- Use IAM roles and temporary credentials for AWS access
- Use `.env.local` for all local configuration

## Troubleshooting

- Ensure all services are running with Docker Compose
- Check `.env.local` files for correct values
- See `ENVIRONMENT_SETUP.md` for more help
   - Name: `BACKEND_URL` 
