#!/bin/bash

# Setup script for MicroK8s cluster configuration
# Run this script to prepare your cluster for Genascope Frontend deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Setting up MicroK8s cluster for Genascope Frontend...${NC}"

# Check if kubectl is configured
if ! kubectl cluster-info &>/dev/null; then
    echo -e "${RED}❌ kubectl is not configured or cluster is not accessible${NC}"
    echo -e "${YELLOW}💡 Please configure kubectl to connect to your MicroK8s cluster first${NC}"
    echo -e "${YELLOW}   Follow these steps:${NC}"
    echo "   1. SSH to your server: ssh user@10.0.0.217"
    echo "   2. Export config: microk8s config > ~/kubeconfig-microk8s"
    echo "   3. Copy to local: scp user@10.0.0.217:~/kubeconfig-microk8s ~/.kube/config"
    echo "   4. Update server: kubectl config set-cluster microk8s-cluster --server=https://10.0.0.217:16443"
    exit 1
fi

echo -e "${GREEN}✅ kubectl is configured and cluster is accessible${NC}"

# Create namespaces
echo -e "${YELLOW}📦 Creating namespaces...${NC}"
for namespace in dev staging production; do
    kubectl create namespace ${namespace} --dry-run=client -o yaml | kubectl apply -f -
    kubectl label namespace ${namespace} name=${namespace} --overwrite
    echo -e "${GREEN}✅ Created namespace: ${namespace}${NC}"
done

# Check if GHCR secret exists
if kubectl get secret ghcr-secret -n default &>/dev/null; then
    echo -e "${GREEN}✅ GHCR secret already exists${NC}"
    
    # Copy to all namespaces
    for namespace in dev staging production; do
        echo -e "${YELLOW}🔑 Copying GHCR secret to ${namespace} namespace${NC}"
        kubectl get secret ghcr-secret -n default -o yaml | \
        sed "s/namespace: default/namespace: ${namespace}/" | \
        kubectl apply -f -
    done
else
    echo -e "${YELLOW}⚠️  GHCR secret not found. Please create it:${NC}"
    echo "kubectl create secret docker-registry ghcr-secret \\"
    echo "  --docker-server=ghcr.io \\"
    echo "  --docker-username=YOUR_GITHUB_USERNAME \\"
    echo "  --docker-password=YOUR_GITHUB_PAT \\"
    echo "  --docker-email=YOUR_EMAIL"
    echo ""
    echo -e "${YELLOW}Then copy it to all namespaces:${NC}"
    for namespace in dev staging production; do
        echo "kubectl get secret ghcr-secret -n default -o yaml | sed 's/namespace: default/namespace: ${namespace}/' | kubectl apply -f -"
    done
    echo ""
fi

# Apply resource quotas
echo -e "${YELLOW}📊 Creating resource quotas...${NC}"
for namespace in dev staging production; do
    cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ResourceQuota
metadata:
  name: compute-quota
  namespace: ${namespace}
spec:
  hard:
    requests.cpu: "2"
    requests.memory: 4Gi
    limits.cpu: "4"
    limits.memory: 8Gi
    persistentvolumeclaims: "10"
    pods: "20"
EOF
    echo -e "${GREEN}✅ Created resource quota for: ${namespace}${NC}"
done

# Apply network policies for isolation
echo -e "${YELLOW}🔒 Creating network policies...${NC}"
for namespace in dev staging production; do
    cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-cross-namespace
  namespace: ${namespace}
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ${namespace}
  egress:
  - to:
    - namespaceSelector:
        matchLabels:
          name: ${namespace}
  - to: []
    ports:
    - protocol: TCP
      port: 53
    - protocol: UDP
      port: 53
    - protocol: TCP
      port: 443
    - protocol: TCP
      port: 80
EOF
    echo -e "${GREEN}✅ Created network policy for: ${namespace}${NC}"
done

echo -e "${GREEN}🎉 Cluster setup completed successfully!${NC}"
echo -e "${BLUE}📋 Next steps:${NC}"
echo -e "1. ${YELLOW}Add to your /etc/hosts:${NC}"
echo "   echo '10.0.0.217 genascope-dev.local' | sudo tee -a /etc/hosts"
echo "   echo '10.0.0.217 genascope-staging.local' | sudo tee -a /etc/hosts"
echo "   echo '10.0.0.217 genascope.local' | sudo tee -a /etc/hosts"
echo ""
echo -e "2. ${YELLOW}Deploy to environments:${NC}"
echo "   ./scripts/deploy.sh dev install"
echo "   ./scripts/deploy.sh staging install"
echo "   ./scripts/deploy.sh prod install"
echo ""
echo -e "3. ${YELLOW}Access your applications:${NC}"
echo "   Development: http://genascope-dev.local"
echo "   Staging: http://genascope-staging.local"
echo "   Production: http://genascope.local"
