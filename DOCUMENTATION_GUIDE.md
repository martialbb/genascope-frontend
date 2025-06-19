# Genascope Documentation Guide

Welcome to the Genascope documentation! This guide provides an overview of all available documentation to help developers, administrators, and users understand and work with the Genascope platform.

## Documentation Overview

The Genascope documentation is organized into several sections:

### Core Documentation

| Document | Description |
|----------|-------------|
| [README.md](/README.md) | Project overview, setup instructions, and feature summary |
| [Frontend Documentation](/FRONTEND_DOCUMENTATION.md) | Comprehensive guide to frontend components and services |
| [Backend Documentation](/backend/BACKEND_DOCUMENTATION.md) | API endpoints, backend services, and implementation details |
| [Repository Structure](/REPOSITORY-STRUCTURE.md) | Organization of code and development workflow |

### Feature-Specific Documentation

| Document | Description |
|----------|-------------|
| [Patient Invite System](/backend/PATIENT_INVITE_DOCUMENTATION.md) | Detailed documentation of the invitation workflow |
| [API Usage Examples](/docs/API_USAGE_EXAMPLES.md) | Code examples for integrating with the API |
| [Architecture Diagrams](/docs/ARCHITECTURE_DIAGRAMS.md) | Visual representations of system architecture and workflows |
| [Database Schema](/docs/DATABASE_SCHEMA.md) | Database structure, relationships, and example queries |

### Technical Guides

| Document | Description |
|----------|-------------|
| [Docker Setup](/DOCKER.md) | Docker configuration and deployment instructions |
| [Troubleshooting Guide](/docs/TROUBLESHOOTING_GUIDE.md) | Solutions to common issues and debugging help |
| [Test Execution Guide](/TEST_EXECUTION_GUIDE.md) | Comprehensive testing instructions and best practices |

### Security & Infrastructure

| Document | Description |
|----------|-------------|
| [Frontend Documentation - Security Section](/FRONTEND_DOCUMENTATION.md#backend-integration--security-architecture) | AWS S3 integration, IAM roles, and security architecture |
| [Infrastructure as Code](/iac/) | Terraform/OpenTofu modules for AWS infrastructure provisioning |
| [Environment Setup](/ENVIRONMENT_SETUP.md) | Environment configuration and AWS setup |

## Documentation for Different Audiences

### For New Developers

If you're new to the project, we recommend reviewing these documents first:

1. [README.md](/README.md) - For a high-level overview
2. [Repository Structure](/REPOSITORY-STRUCTURE.md) - To understand the codebase organization
3. [Frontend Documentation](/FRONTEND_DOCUMENTATION.md) - To understand the user interface implementation
4. [Backend Documentation](/backend/BACKEND_DOCUMENTATION.md) - To understand the API and backend services
5. [Architecture Diagrams](/docs/ARCHITECTURE_DIAGRAMS.md) - To visualize how everything fits together

### For Frontend Developers

Focus on these documents:

1. [Frontend Documentation](/FRONTEND_DOCUMENTATION.md) - Comprehensive guide to components
2. [API Usage Examples](/docs/API_USAGE_EXAMPLES.md) - How to interact with backend services
3. [Troubleshooting Guide](/docs/TROUBLESHOOTING_GUIDE.md) - Solutions to common frontend issues

### For Backend Developers

Focus on these documents:

1. [Backend Documentation](/backend/BACKEND_DOCUMENTATION.md) - API endpoints and implementation
2. [Database Schema](/docs/DATABASE_SCHEMA.md) - Database structure and queries
3. [Patient Invite System](/backend/PATIENT_INVITE_DOCUMENTATION.md) - Example of a specific backend feature

### For DevOps Engineers

Focus on these documents:

1. [Docker Setup](/DOCKER.md) - Containerization and deployment
2. [Repository Structure](/REPOSITORY-STRUCTURE.md) - Project organization
3. [Frontend Documentation - Security Section](/FRONTEND_DOCUMENTATION.md#backend-integration--security-architecture) - AWS infrastructure and security setup
4. [Infrastructure as Code](/iac/) - Terraform/OpenTofu modules for AWS provisioning
5. [Troubleshooting Guide](/docs/TROUBLESHOOTING_GUIDE.md) - Debugging production issues

### For Security Engineers

Focus on these documents:

1. [Frontend Documentation - Security Section](/FRONTEND_DOCUMENTATION.md#backend-integration--security-architecture) - Comprehensive security architecture documentation
2. [Infrastructure as Code](/iac/) - IAM roles, policies, and S3 bucket security configuration
3. [Environment Setup](/ENVIRONMENT_SETUP.md) - Secure environment configuration guidelines

## Documentation Maintenance

### Contributing to Documentation

When contributing to the documentation:

1. **Update relevant files**: When changing a feature, update any related documentation
2. **Use consistent formatting**: Follow the established Markdown formatting style
3. **Add examples**: Include code examples where applicable
4. **Keep diagrams up-to-date**: Update architecture diagrams when system design changes
5. **Test code examples**: Ensure that all code examples work as expected

### Documentation TODO List

The following documentation improvements are planned:

1. **User Guides**: Create end-user documentation for patients and clinicians
2. **API Reference**: Generate OpenAPI documentation from the backend code
3. **Development Standards**: Document coding standards and conventions
4. ✅ **Security Documentation**: Comprehensive security implementation guide (completed)
5. **Performance Optimization**: Document performance best practices and benchmarks
6. ✅ **Infrastructure Documentation**: Terraform/OpenTofu modules and AWS setup (completed)

## Getting Help

If you cannot find the information you need in the documentation:

1. Check the [Troubleshooting Guide](/docs/TROUBLESHOOTING_GUIDE.md) for common issues
2. Submit an issue in the project repository
3. Contact the development team at support@genascope.example.com
