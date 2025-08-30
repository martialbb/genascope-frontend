# Genascope Frontend Helm Chart

A Helm chart for deploying the Genascope Frontend application on Kubernetes.

## Prerequisites

- Kubernetes 1.19+
- Helm 3.2.0+
- A secret named `ghcr-secret` with access to GitHub Container Registry

## Installing the Chart

### Development Environment
```bash
helm install genascope-frontend ./helm/genascope-frontend \
  -f ./helm/genascope-frontend/values/dev.yaml \
  --namespace dev --create-namespace
```

### Staging Environment
```bash
helm install genascope-frontend ./helm/genascope-frontend \
  -f ./helm/genascope-frontend/values/staging.yaml \
  --namespace staging --create-namespace
```

### Production Environment
```bash
helm install genascope-frontend ./helm/genascope-frontend \
  -f ./helm/genascope-frontend/values/prod.yaml \
  --namespace production --create-namespace
```

## Upgrading the Chart

```bash
helm upgrade genascope-frontend ./helm/genascope-frontend \
  -f ./helm/genascope-frontend/values/[environment].yaml \
  --namespace [namespace]
```

## Uninstalling the Chart

```bash
helm uninstall genascope-frontend --namespace [namespace]
```

## Configuration

The following table lists the configurable parameters and their default values.

| Parameter | Description | Default |
|-----------|-------------|---------|
| `replicaCount` | Number of replicas | `1` |
| `image.repository` | Image repository | `ghcr.io/martialbb/genascope-frontend` |
| `image.tag` | Image tag | `latest` |
| `config.backendUrl` | Backend API URL | `http://localhost:8000` |
| `service.type` | Service type | `ClusterIP` |
| `ingress.enabled` | Enable ingress | `false` |

See `values.yaml` for the complete list of parameters.

## Security

This chart implements security best practices:
- Non-root user execution
- Read-only root filesystem where possible
- Security contexts with dropped capabilities
- Resource limits and requests
- Health checks and probes
