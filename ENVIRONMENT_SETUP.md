# Environment Configuration

## 🔐 Security Best Practices

This project uses environment variables for configuration to avoid committing secrets to Git. The backend integrates with AWS S3 using IAM role assumption for enhanced security, following the principle of least privilege.

## 📁 File Structure

```
├── .env.example          # Template with all available variables  
├── .env.local           # Frontend local development config (ignored by Git)
├── backend/.env.local   # Backend local development config (ignored by Git)
├── docker-compose.postgresql.dev.yml # Uses environment variables with defaults
├── iac/                 # Infrastructure as Code (Terraform/OpenTofu)
└── .gitignore          # Ensures .env files are not committed
```

## 🚀 Quick Setup

### 1. Infrastructure Setup (AWS)

First, provision the AWS infrastructure:

```bash
cd iac/environments/dev
tofu init
tofu plan
tofu apply
```

This creates:
- S3 bucket for file storage
- IAM role for backend service  
- IAM policies with least-privilege access
- S3 bucket policy enforcing TLS

### 2. Environment Configuration

Copy the templates and configure with your AWS credentials:

```bash
# Frontend environment
cp .env.example .env.local

# Backend environment
cp backend/.env.example backend/.env.local
```

### 3. Configure Environment Files

**Frontend (`.env.local`)**:
```bash
PUBLIC_API_URL=http://localhost:8000
AWS_DEFAULT_REGION=us-west-2
AWS_ACCESS_KEY_ID=your-initial-aws-access-key
AWS_SECRET_ACCESS_KEY=your-initial-aws-secret-key
```

**Backend (`backend/.env.local`)**:
```bash
AWS_DEFAULT_REGION=us-west-2
AWS_ACCESS_KEY_ID=your-initial-aws-access-key
AWS_SECRET_ACCESS_KEY=your-initial-aws-secret-key
S3_BUCKET_NAME=genascope-dev-knowledge-sources
BACKEND_ROLE_NAME=genascope-dev-backend-role
```

### 4. Start Services

```bash
docker-compose -f docker-compose.postgresql.dev.yml up -d --build
```

## 📝 Environment Variables

### AWS S3 Configuration (Recommended)

The backend uses AWS S3 with IAM role assumption for secure file storage:

```bash
# Backend Configuration
AWS_DEFAULT_REGION=us-west-2
AWS_ACCESS_KEY_ID=initial-access-key-for-role-assumption
AWS_SECRET_ACCESS_KEY=initial-secret-for-role-assumption
S3_BUCKET_NAME=genascope-dev-knowledge-sources
BACKEND_ROLE_NAME=genascope-dev-backend-role

# Frontend Configuration  
PUBLIC_API_URL=http://localhost:8000
AWS_DEFAULT_REGION=us-west-2
```

**Security Features**:
- Backend assumes IAM role for AWS operations (no long-term credentials in production)
- Temporary credentials obtained via AWS STS
- Least-privilege IAM policies
- TLS enforcement for all S3 operations
- Regional STS endpoint for reliability

### Storage Provider Options

| Variable | Options | Description |
|----------|---------|-------------|
| `STORAGE_PROVIDER` | `s3` (recommended), `local`, `minio` | Storage backend to use |
| `S3_BUCKET_NAME` | string | S3 bucket name for file storage |
| `BACKEND_ROLE_NAME` | string | IAM role name for backend service |

### Legacy MinIO Setup (Development Only)
```bash
STORAGE_PROVIDER=minio
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=your-secure-password
```

### AWS S3 Direct Access (Not Recommended for Production)
```bash
STORAGE_PROVIDER=s3
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=us-west-2
```

## 🛡️ Security Notes

- ✅ `.env.local` files are ignored by Git
- ✅ Backend uses IAM role assumption with temporary credentials
- ✅ No long-term AWS credentials stored in production
- ✅ TLS enforced for all S3 operations via bucket policy
- ✅ Least-privilege IAM policies for specific AWS services
- ✅ Regional STS endpoint for reliable role assumption
- ✅ Docker Compose uses environment variables with secure defaults
- ✅ Production secrets should be managed via Docker secrets or cloud secret managers
- ❌ Never commit actual secrets to the repository

## 🔄 Role Assumption Flow

1. **Development**: Backend uses initial AWS credentials to assume IAM role
2. **Production**: Backend uses instance profile or service role to assume IAM role
3. **AWS STS**: Returns temporary credentials (valid for 1 hour)
4. **S3 Operations**: All file operations use temporary credentials over TLS
5. **Credential Refresh**: Automatic renewal before expiration

## ⚙️ Infrastructure as Code

The project includes Terraform/OpenTofu modules for AWS infrastructure:

```bash
# Navigate to infrastructure
cd iac/environments/dev

# Initialize
tofu init

# Plan changes
tofu plan

# Apply infrastructure
tofu apply

# View outputs (bucket name, role ARN, etc.)
tofu output
```

**Provisioned Resources**:
- S3 bucket with versioning and encryption
- IAM role for backend service
- Least-privilege IAM policies
- S3 bucket policy enforcing TLS

## 🐳 Docker Compose Environment

The `docker-compose.postgresql.dev.yml` file uses environment variable substitution:

```yaml
services:
  backend:
    env_file:
      - backend/.env.local
    environment:
      - AWS_DEFAULT_REGION=${AWS_DEFAULT_REGION:-us-west-2}
      - S3_BUCKET_NAME=${S3_BUCKET_NAME:-genascope-dev-knowledge-sources}
```

This means:
- Backend loads environment variables from `backend/.env.local`
- Environment variables can be overridden at runtime
- Fall back to secure defaults if not set

## 📋 Production Deployment

For production, use:
- **IAM Instance Profiles** or **Service Roles** for AWS access (no long-term keys)
- **Docker secrets** for sensitive configuration
- **Kubernetes secrets** for container orchestration
- **Cloud provider secret managers** (AWS Secrets Manager, Azure Key Vault, GCP Secret Manager)
- **Environment variables injected by CI/CD pipelines**

**Security Best Practices for Production**:
- Use IAM roles instead of access keys
- Rotate credentials regularly
- Monitor AWS CloudTrail for access logs
- Use VPC endpoints for S3 access
- Enable S3 bucket logging and monitoring

**Never use `.env` files or long-term AWS credentials in production!**
