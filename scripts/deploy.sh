#!/bin/bash

# Deployment script for Genascope Frontend to MicroK8s
# Usage: ./deploy.sh [environment] [action]
# Example: ./deploy.sh dev install

set -e

ENVIRONMENT=${1:-dev}
ACTION=${2:-install}
NAMESPACE=${ENVIRONMENT}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Deploying Genascope Frontend to ${ENVIRONMENT} environment...${NC}"

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
    echo -e "${RED}❌ Invalid environment. Use: dev, staging, or prod${NC}"
    exit 1
fi

# Check if kubectl is configured
if ! kubectl cluster-info &>/dev/null; then
    echo -e "${RED}❌ kubectl is not configured or cluster is not accessible${NC}"
    echo -e "${YELLOW}💡 Please configure kubectl to connect to your MicroK8s cluster${NC}"
    exit 1
fi

# Create namespace if it doesn't exist
echo -e "${YELLOW}📦 Creating namespace: ${NAMESPACE}${NC}"
kubectl create namespace ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -
kubectl label namespace ${NAMESPACE} name=${NAMESPACE} --overwrite

# Check if ghcr-secret exists in the namespace
if ! kubectl get secret ghcr-secret -n ${NAMESPACE} &>/dev/null; then
    echo -e "${YELLOW}🔑 Copying GHCR secret to ${NAMESPACE} namespace${NC}"
    if kubectl get secret ghcr-secret -n default &>/dev/null; then
        kubectl get secret ghcr-secret -n default -o yaml | \
        sed "s/namespace: default/namespace: ${NAMESPACE}/" | \
        kubectl apply -f -
    else
        echo -e "${RED}❌ GHCR secret not found in default namespace${NC}"
        echo -e "${YELLOW}💡 Please create ghcr-secret first:${NC}"
        echo "kubectl create secret docker-registry ghcr-secret \\"
        echo "  --docker-server=ghcr.io \\"
        echo "  --docker-username=YOUR_GITHUB_USERNAME \\"
        echo "  --docker-password=YOUR_GITHUB_PAT \\"
        echo "  --docker-email=YOUR_EMAIL"
        exit 1
    fi
fi

# Deploy with Helm
ACTION_DISPLAY=$(echo "${ACTION}" | awk '{print toupper(substr($0,1,1)) tolower(substr($0,2))}')
echo -e "${YELLOW}⚙️  ${ACTION_DISPLAY}ing with Helm...${NC}"
case $ACTION in
    install)
        helm install genascope-frontend-${ENVIRONMENT} ./helm/genascope-frontend \
            -f ./helm/genascope-frontend/values/${ENVIRONMENT}.yaml \
            --namespace ${NAMESPACE} \
            --create-namespace
        ;;
    upgrade)
        helm upgrade genascope-frontend-${ENVIRONMENT} ./helm/genascope-frontend \
            -f ./helm/genascope-frontend/values/${ENVIRONMENT}.yaml \
            --namespace ${NAMESPACE}
        
        # Force pods to pull the latest image (needed when using :latest tag)
        echo -e "${YELLOW}🔄 Triggering rollout restart to pull latest image...${NC}"
        kubectl rollout restart deployment/genascope-frontend-${ENVIRONMENT} -n ${NAMESPACE}
        ;;
    uninstall)
        helm uninstall genascope-frontend-${ENVIRONMENT} --namespace ${NAMESPACE}
        echo -e "${GREEN}✅ Uninstalled genascope-frontend-${ENVIRONMENT}${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}❌ Invalid action. Use: install, upgrade, or uninstall${NC}"
        exit 1
        ;;
esac

# Wait for deployment to be ready
echo -e "${YELLOW}⏳ Waiting for deployment to be ready...${NC}"
kubectl rollout status deployment/genascope-frontend-${ENVIRONMENT} -n ${NAMESPACE} --timeout=300s

# Show deployment status
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${BLUE}📊 Deployment Status:${NC}"
kubectl get pods -n ${NAMESPACE} -l app.kubernetes.io/instance=genascope-frontend-${ENVIRONMENT}
kubectl get services -n ${NAMESPACE} -l app.kubernetes.io/instance=genascope-frontend-${ENVIRONMENT}
kubectl get ingress -n ${NAMESPACE} -l app.kubernetes.io/instance=genascope-frontend-${ENVIRONMENT}

echo -e "${BLUE}🔒 Network Policy Status:${NC}"
kubectl get networkpolicy -n ${NAMESPACE} || echo "No network policies found"

echo -e "${GREEN}🌐 Access URLs:${NC}"
case $ENVIRONMENT in
    dev)
        echo -e "Development: ${BLUE}http://genascope-dev.local${NC} (add to /etc/hosts: 10.0.0.217 genascope-dev.local)"
        ;;
    staging)
        echo -e "Staging: ${BLUE}http://genascope-staging.local${NC} (add to /etc/hosts: 10.0.0.217 genascope-staging.local)"
        ;;
    prod)
        echo -e "Production: ${BLUE}http://genascope.local${NC} (add to /etc/hosts: 10.0.0.217 genascope.local)"
        ;;
esac

echo -e "${YELLOW}💡 To check logs: kubectl logs -f deployment/genascope-frontend-${ENVIRONMENT} -n ${NAMESPACE}${NC}"
echo -e "${YELLOW}💡 To port forward: kubectl port-forward svc/genascope-frontend-${ENVIRONMENT} 8080:80 -n ${NAMESPACE}${NC}"
echo -e "${YELLOW}💡 To test network policy: ./scripts/test-network-policy.sh ${ENVIRONMENT}${NC}"
