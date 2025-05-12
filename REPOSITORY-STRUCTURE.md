# CancerGenix Repository Structure

This document outlines the recommended repository structure for the CancerGenix application.

## Repository Architecture

CancerGenix is structured as two separate repositories:

1. **cancer-genix-frontend** (this repository)
   - Astro framework with React/TypeScript components
   - Tailwind CSS for styling
   - Connects to backend API via axios

2. **cancer-genix-backend** (to be created separately)
   - FastAPI Python backend
   - MySQL database
   - AI-driven eligibility analysis

## Why Separate Repositories?

We've chosen to use separate repositories for several reasons:

1. **Different technology stacks**: The frontend uses JavaScript/TypeScript while the backend uses Python
2. **Independent scaling**: Frontend and backend can be scaled independently
3. **Separate deployment pipelines**: Deploy frontend static assets to CDN, backend to server infrastructure
4. **Security considerations**: Keeps sensitive backend code and configurations separate
5. **Team organization**: Allows frontend and backend teams to work independently

## Repository Setup

### Frontend (cancer-genix-frontend)

This repository has already been renamed from `cancer-genix` to `cancer-genix-frontend` on GitHub.

### Backend (cancer-genix-backend)

To create the backend repository:

1. Run the provided setup script:
   ```bash
   ./setup_backend_repo.sh
   ```

2. Create a new GitHub repository named `cancer-genix-backend`

3. Push the newly created backend code to GitHub:
   ```bash
   cd ../cancer-genix-backend
   git add .
   git commit -m "Initial backend setup"
   git remote add origin https://github.com/martialbb/cancer-genix-backend.git
   git branch -M main
   git push -u origin main
   ```

## Development Workflow

For local development, you'll need to run both repositories:

### Frontend Development
```bash
# In the cancer-genix-frontend directory
npm install
npm run dev
```

### Backend Development
```bash
# In the cancer-genix-backend directory
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Alternatively, you can use Docker Compose for the backend:
```bash
# In the cancer-genix-backend directory
docker-compose up
```

## Environment Configuration

### Frontend Environment Variables
- Copy `.env.development` to `.env` and update values as needed
- `PUBLIC_API_URL`: URL of the backend API (default: http://localhost:8000)
- `PUBLIC_BASE_URL`: URL of the frontend (default: http://localhost:4321)

### Backend Environment Variables
- Copy `.env.example` to `.env` and update values as needed
- `DATABASE_URI`: Connection string for the database
- `SECRET_KEY`: JWT signing key
- `CORS_ORIGINS`: List of allowed frontend origins for CORS

## API Contract

The frontend and backend communicate through a defined API contract. The key endpoints are:

- `/api/start_chat`: Start or resume a chat session
- `/api/submit_answer`: Submit a chat answer and get the next question
- `/api/history/{session_id}`: Get chat history for a session
- `/api/auth/token`: JWT token authentication
- `/api/generate_invite`: Generate a patient invite URL
- `/api/admin/create_account`: Create a new account (super admin only)
- `/api/account/create_user`: Create a new user (account admin only)
- `/api/eligibility/analyze`: Analyze patient eligibility
- `/api/labs/order_test`: Order a lab test
- `/api/labs/results/{order_id}`: Get lab test results

## Next Steps

1. Create the backend repository using the setup script
2. Implement the backend API endpoints
3. Connect frontend components to the backend API
4. Set up CI/CD for both repositories
5. Deploy to development/staging/production environments
