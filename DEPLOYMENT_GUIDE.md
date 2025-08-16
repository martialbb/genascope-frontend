# 🚀 Multi-Environment Deployment Guide

This project uses a parameterized deployment system that supports Development, Staging, and Production environments with GitHub Flow.

## 📋 Environment Overview

| Environment | Branch | App Name | Backend URL | Auto-Deploy |
|-------------|--------|----------|-------------|-------------|
| **Development** | PRs → `main` | `genascope-frontend-dev` | Current dev backend | ✅ On PR |
| **Staging** | `staging` | `genascope-frontend-staging` | Staging backend | ✅ On push |
| **Production** | `main` | `genascope-frontend` | Production backend | ✅ On push |

## 🔧 Configuration Files

- **`scripts/generate-fly-config.js`** - Dynamic Fly.io configuration generator
- **`config/.env.*`** - Environment-specific configuration templates
- **`src/services/apiConfig.ts`** - Environment-aware API URL detection
- **`.github/workflows/fly-deploy.yml`** - GitHub Actions deployment pipeline

## 🌍 GitHub Configuration Required

Each environment needs these configured in GitHub:

### Development Environment
- **Secret**: `FLY_API_TOKEN` - Fly.io token for dev deployments
- **Variable**: `BACKEND_URL` - Development backend URL (e.g., `https://genascope-backend.fly.dev/`)

### Staging Environment  
- **Secret**: `FLY_API_TOKEN` - Fly.io token for staging deployments
- **Variable**: `BACKEND_URL` - Staging backend URL (e.g., `https://genascope-backend-staging.fly.dev`)

### Production Environment
- **Secret**: `FLY_API_TOKEN` - Fly.io token for production deployments  
- **Variable**: `BACKEND_URL` - Production backend URL (e.g., `https://genascope-backend-prod.fly.dev`)

### 🔧 Setting up GitHub Environment Configuration

1. **Go to your GitHub repository** → Settings → Environments
2. **For each environment** (dev, staging, prod):
   - Click on the environment name
   - **Add Environment Secret**:
     - `FLY_API_TOKEN` - Your Fly.io API token
   - **Add Environment Variable**:
     - `BACKEND_URL` - Your backend URL for that environment
3. **Example URLs**:
   - **Dev**: `https://genascope-backend.fly.dev/`
   - **Staging**: `https://genascope-backend-staging.fly.dev`
   - **Production**: `https://genascope-backend-prod.fly.dev`

> **💡 Note**: We use Environment Variables for backend URLs (non-sensitive) and Environment Secrets for API tokens (sensitive).

## 🚀 Deployment Workflows

### 1. Feature Development (GitHub Flow)
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and push
git push origin feature/new-feature

# Create PR → Auto-deploys to development environment
```

### 2. Staging Deployment
```bash
# Merge ready features to staging branch
git checkout staging
git merge main
git push origin staging

# Auto-deploys to staging environment
```

### 3. Production Deployment
```bash
# Merge staging to main (or direct hotfix)
git checkout main
git merge staging  # or direct changes for hotfix
git push origin main

# Auto-deploys to production environment
```

## 🛠️ Manual Deployment Commands

```bash
# Generate and deploy to development
npm run deploy:dev

# Generate and deploy to staging  
npm run deploy:staging

# Generate and deploy to production
npm run deploy:prod

# Just generate configuration (no deploy)
npm run fly:config:dev
npm run fly:config:staging
npm run fly:config:prod
```

## 🔍 Environment Detection

The application automatically detects the environment based on:

1. **Environment Variables** (highest priority)
   - `PUBLIC_API_URL` - Explicit backend URL
   - `NODE_ENV` - Environment name

2. **Hostname Detection** (client-side)
   - `genascope-frontend.fly.dev` → Production
   - `genascope-frontend-staging.fly.dev` → Staging  
   - `localhost` or dev domains → Development

3. **Default Fallbacks**
   - Development: `http://localhost:8000`
   - Staging: `https://genascope-backend-staging.fly.dev`
   - Production: `https://genascope-backend.fly.dev`

## 📝 Configuration Examples

### Development
```bash
# Local development
npm run fly:config:dev
# Uses: http://localhost:8000 or current dev backend
```

### Staging  
```bash
# Staging deployment
PUBLIC_API_URL=https://my-staging-backend.fly.dev npm run fly:config:staging
```

### Production
```bash
# Production deployment  
PUBLIC_API_URL=https://my-prod-backend.fly.dev npm run fly:config:prod
```

## 🔄 Branch Strategy

- **`main`** → Production-ready code (auto-deploys to production)
- **`staging`** → Integration testing (auto-deploys to staging)
- **`feature/*`** → Development branches (auto-deploys to dev via PR)
- **`hotfix/*`** → Emergency fixes (can merge directly to main)

## 🚨 Troubleshooting

### Missing Environment Variables
```bash
# Check if secrets are configured
echo $FLY_API_TOKEN
echo $PUBLIC_API_URL

# Verify Fly.io authentication
flyctl auth whoami
```

### Configuration Issues
```bash
# Regenerate configuration
npm run fly:config:dev

# Check generated configuration
cat fly.toml

# Test deployment
flyctl deploy --dry-run
```

### API Connection Issues
- Check browser console for API configuration logs (in development)
- Verify backend URL in Network tab
- Confirm backend service is running and accessible

## 📚 File Structure

```
├── config/
│   ├── .env.development     # Dev environment config template
│   ├── .env.staging        # Staging environment config template
│   └── .env.production     # Production environment config template
├── scripts/
│   └── generate-fly-config.js  # Dynamic Fly.io config generator
├── src/services/
│   └── apiConfig.ts        # Environment-aware API configuration
├── .github/workflows/
│   └── fly-deploy.yml      # Multi-environment deployment pipeline
├── fly.toml               # Current environment Fly.io config
├── fly.development.toml   # Development backup config
├── fly.staging.toml       # Staging backup config
└── fly.production.toml    # Production backup config
```

This setup provides a robust, parameterized deployment system that scales from solo development to team collaboration while maintaining environment isolation and configuration flexibility.
