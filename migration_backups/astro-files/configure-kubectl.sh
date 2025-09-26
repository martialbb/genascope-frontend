#!/bin/bash

# kubectl configuration script for remote MicroK8s cluster
# This script helps configure kubectl to connect to the remote MicroK8s cluster

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

REMOTE_SERVER="10.0.0.217"
REMOTE_USER=${1:-$USER}

if [ -z "$REMOTE_USER" ]; then
    echo -e "${RED}❌ Please provide the remote username${NC}"
    echo "Usage: $0 <remote_username>"
    echo "Example: $0 ubuntu"
    exit 1
fi

echo -e "${BLUE}🔧 Configuring kubectl for remote MicroK8s cluster...${NC}"
echo -e "${YELLOW}Remote server: ${REMOTE_SERVER}${NC}"
echo -e "${YELLOW}Remote user: ${REMOTE_USER}${NC}"

# Backup existing kubeconfig
if [ -f ~/.kube/config ]; then
    echo -e "${YELLOW}📦 Backing up existing kubeconfig...${NC}"
    cp ~/.kube/config ~/.kube/config.backup.$(date +%Y%m%d_%H%M%S)
fi

# Create .kube directory if it doesn't exist
mkdir -p ~/.kube

echo -e "${YELLOW}🔗 Copying kubeconfig from remote server...${NC}"
echo "This will prompt for SSH password/key for ${REMOTE_USER}@${REMOTE_SERVER}"

# Get kubeconfig from remote server
ssh ${REMOTE_USER}@${REMOTE_SERVER} 'microk8s config' > ~/.kube/config-microk8s

# Update the server address to use the remote IP
echo -e "${YELLOW}⚙️  Updating server address...${NC}"
kubectl config --kubeconfig=~/.kube/config-microk8s set-cluster microk8s-cluster --server=https://${REMOTE_SERVER}:16443

# Use the new config
cp ~/.kube/config-microk8s ~/.kube/config

echo -e "${YELLOW}🧪 Testing connection...${NC}"
if kubectl cluster-info &>/dev/null; then
    echo -e "${GREEN}✅ Successfully connected to remote MicroK8s cluster!${NC}"
    echo -e "${BLUE}📊 Cluster info:${NC}"
    kubectl cluster-info
    echo ""
    echo -e "${BLUE}📋 Available nodes:${NC}"
    kubectl get nodes
else
    echo -e "${RED}❌ Failed to connect to remote cluster${NC}"
    echo -e "${YELLOW}💡 Troubleshooting tips:${NC}"
    echo "1. Ensure MicroK8s is running on the remote server:"
    echo "   ssh ${REMOTE_USER}@${REMOTE_SERVER} 'microk8s status'"
    echo ""
    echo "2. Check if port 16443 is accessible:"
    echo "   telnet ${REMOTE_SERVER} 16443"
    echo ""
    echo "3. Ensure firewall allows access:"
    echo "   ssh ${REMOTE_USER}@${REMOTE_SERVER} 'sudo ufw allow 16443/tcp'"
    echo ""
    echo "4. If using SSH tunnel:"
    echo "   ssh -L 16443:localhost:16443 ${REMOTE_USER}@${REMOTE_SERVER} -N &"
    echo "   kubectl config set-cluster microk8s-cluster --server=https://localhost:16443"
    exit 1
fi

echo -e "${GREEN}🎉 kubectl configuration completed successfully!${NC}"
echo -e "${BLUE}📋 Next steps:${NC}"
echo "1. Run the cluster setup: ./scripts/setup-cluster.sh"
echo "2. Deploy applications: ./scripts/deploy.sh dev install"
