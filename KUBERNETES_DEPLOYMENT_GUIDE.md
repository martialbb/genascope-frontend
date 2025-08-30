# 🚀 Kubernetes Deployment Guide

This guide walks you through deploying the Genascope Frontend to your MicroK8s cluster on `10.0.0.217`.

## 📋 Prerequisites

- MicroK8s cluster running on `10.0.0.217`
- kubectl installed on your local machine
- GitHub Personal Access Token with `read:packages` scope
- Helm 3.x installed

## 🔧 Step 1: Configure kubectl

First, configure kubectl to connect to your remote MicroK8s cluster:

```bash
# Run the kubectl configuration script
./scripts/configure-kubectl.sh <remote_username>

# Example:
./scripts/configure-kubectl.sh ubuntu
```

This script will:
- Copy the kubeconfig from the remote server
- Update the server address to use `10.0.0.217:16443`
- Test the connection

### Manual kubectl Configuration (if script fails)

```bash
# SSH to remote server and get config
ssh user@10.0.0.217 'microk8s config' > ~/.kube/config-microk8s

# Update server address
kubectl config --kubeconfig=~/.kube/config-microk8s set-cluster microk8s-cluster --server=https://10.0.0.217:16443

# Use the new config
cp ~/.kube/config-microk8s ~/.kube/config

# Test connection
kubectl cluster-info
```

## 🔑 Step 2: Create GHCR Secret

Create a secret for accessing GitHub Container Registry:

```bash
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=YOUR_GITHUB_USERNAME \
  --docker-password=YOUR_GITHUB_PAT \
  --docker-email=YOUR_EMAIL
```

## 🏗️ Step 3: Setup Cluster

Run the cluster setup script to create namespaces, resource quotas, and network policies:

```bash
./scripts/setup-cluster.sh
```

This script will:
- Create `dev`, `staging`, and `production` namespaces
- Copy GHCR secrets to all namespaces
- Apply resource quotas
- Set up network policies for namespace isolation

## 🌐 Step 4: Configure Local DNS

Add entries to your `/etc/hosts` file for local testing:

```bash
echo '10.0.0.217 genascope-dev.local' | sudo tee -a /etc/hosts
echo '10.0.0.217 genascope-staging.local' | sudo tee -a /etc/hosts
echo '10.0.0.217 genascope.local' | sudo tee -a /etc/hosts
```

## 🚀 Step 5: Deploy Applications

Deploy to each environment using the deployment script:

### Development Environment
```bash
./scripts/deploy.sh dev install
```

### Staging Environment
```bash
./scripts/deploy.sh staging install
```

### Production Environment
```bash
./scripts/deploy.sh prod install
```

## 🔍 Step 6: Verify Deployments

Check the status of your deployments:

```bash
# Check all pods
kubectl get pods -A

# Check specific environment
kubectl get pods -n dev
kubectl get services -n dev
kubectl get ingress -n dev

# Check logs
kubectl logs -f deployment/genascope-frontend-dev -n dev
```

## 🌍 Step 7: Access Applications

Once deployed, access your applications via:

- **Development**: http://genascope-dev.local
- **Staging**: http://genascope-staging.local
- **Production**: http://genascope.local

### Port Forwarding (Alternative Access)

If ingress is not working, use port forwarding:

```bash
# Development
kubectl port-forward svc/genascope-frontend-dev 8080:80 -n dev
# Access: http://localhost:8080

# Staging
kubectl port-forward svc/genascope-frontend-staging 8081:80 -n staging
# Access: http://localhost:8081

# Production
kubectl port-forward svc/genascope-frontend-prod 8082:80 -n production
# Access: http://localhost:8082
```

## 🔄 Management Commands

### Upgrade Deployments
```bash
./scripts/deploy.sh dev upgrade
./scripts/deploy.sh staging upgrade
./scripts/deploy.sh prod upgrade
```

### Uninstall Deployments
```bash
./scripts/deploy.sh dev uninstall
./scripts/deploy.sh staging uninstall
./scripts/deploy.sh prod uninstall
```

### Manual Helm Commands
```bash
# List releases
helm list -A

# Check release status
helm status genascope-frontend-dev -n dev

# View release history
helm history genascope-frontend-dev -n dev

# Rollback if needed
helm rollback genascope-frontend-dev 1 -n dev
```

## 🛠️ Troubleshooting

### Connection Issues
```bash
# Test cluster connectivity
kubectl cluster-info

# Check node status
kubectl get nodes

# Verify kubectl context
kubectl config current-context
```

### Pod Issues
```bash
# Check pod status
kubectl describe pod <pod-name> -n <namespace>

# Check events
kubectl get events -n <namespace> --sort-by='.lastTimestamp'

# Check logs
kubectl logs <pod-name> -n <namespace>
```

### Image Pull Issues
```bash
# Check if secret exists
kubectl get secrets -n <namespace>

# Verify secret content
kubectl describe secret ghcr-secret -n <namespace>

# Test image pull manually
kubectl run test-pod --image=ghcr.io/martialbb/genascope-frontend:latest -n <namespace>
```

### Ingress Issues
```bash
# Check ingress status
kubectl get ingress -A

# Check ingress controller
kubectl get pods -n ingress

# Verify /etc/hosts entries
cat /etc/hosts | grep genascope
```

## 📊 Monitoring

### Resource Usage
```bash
# Check resource usage
kubectl top nodes
kubectl top pods -A

# Check resource quotas
kubectl describe quota -n dev
kubectl describe quota -n staging
kubectl describe quota -n production
```

### Network Policies
```bash
# Check network policies
kubectl get networkpolicies -A

# Describe policy
kubectl describe networkpolicy deny-cross-namespace -n dev
```

## 🔒 Security Notes

- Each environment is isolated using Kubernetes namespaces
- Network policies prevent cross-namespace communication
- Resource quotas limit resource usage per namespace
- GHCR secrets are namespaced for security
- All containers run as non-root users

## 📝 File Structure

```
scripts/
├── configure-kubectl.sh    # Configure kubectl for remote cluster
├── setup-cluster.sh       # Initial cluster setup
└── deploy.sh              # Deploy/upgrade/uninstall applications

helm/genascope-frontend/
├── Chart.yaml             # Helm chart metadata
├── values.yaml            # Default values
├── values/
│   ├── dev.yaml          # Development environment values
│   ├── staging.yaml      # Staging environment values
│   └── prod.yaml         # Production environment values
└── templates/            # Kubernetes templates
    ├── deployment.yaml
    ├── service.yaml
    ├── ingress.yaml
    ├── configmap.yaml
    ├── serviceaccount.yaml
    ├── hpa.yaml
    ├── network-policy-dev.yaml
    └── resource-quota.yaml
```

This deployment setup provides a production-ready, scalable, and secure environment for your Genascope Frontend application.
