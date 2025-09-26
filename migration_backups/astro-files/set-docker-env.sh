#!/bin/sh
# This script sets up environment variables for the Docker environment
# It will be used by the Docker entrypoint script

# Detect if we're running inside Docker 
if [ -f "/.dockerenv" ] || [ -f "/proc/1/cgroup" ] && grep -q "docker" /proc/1/cgroup; then
  echo "Running in Docker environment"
  # Set Docker-specific environment variables
  export DOCKER_ENV=true
  export PUBLIC_API_URL=http://backend:8000
  echo "PUBLIC_API_URL set to $PUBLIC_API_URL"
else
  echo "Not running in Docker environment"
  # Set local development environment variables if needed
  export DOCKER_ENV=false
  export PUBLIC_API_URL=http://localhost:8000
  echo "PUBLIC_API_URL set to $PUBLIC_API_URL"
fi

# Print environment information for debugging
echo "Environment: $([ "$DOCKER_ENV" = "true" ] && echo "Docker" || echo "Local")"
echo "API URL: $PUBLIC_API_URL"

# Execute the provided command with the environment variables
exec "$@"
