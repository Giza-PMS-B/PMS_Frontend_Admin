# DevOps Technical Documentation

This document provides technical details about the DevOps infrastructure, CI/CD pipeline, and deployment architecture for the PMS Frontend Admin application.

## Architecture Overview

The application uses a multi-stage Docker build process and is deployed using Docker Swarm orchestration. The CI/CD pipeline is managed through Jenkins.

## Docker Configuration

### Dockerfile Structure

The Dockerfile uses a multi-stage build approach:

#### Stage 1: Build Stage
- **Base Image**: `node:20-alpine`
- **Purpose**: Build the Angular application
- **Steps**:
  1. Copy `package*.json` files
  2. Run `npm ci` for dependency installation
  3. Copy source code
  4. Execute `npm run build` to create production build

#### Stage 2: Runtime Stage
- **Base Image**: `nginx:alpine`
- **Purpose**: Serve the built Angular application
- **Steps**:
  1. Remove default nginx configuration
  2. Copy custom `nginx.conf`
  3. Copy build artifacts from Stage 1 to `/usr/share/nginx/html`
  4. Expose port 80

### Docker Compose Configuration

The `docker-compose.yml` file defines:

- **Service Name**: `admin-frontend`
- **Image**: Uses `${IMAGE_TAG}` environment variable
- **Port Mapping**: `8085:80` (host:container)
- **Network**: `pms-network` (external network)
- **Deployment**:
  - Replicas: 2
  - Restart Policy: `on-failure`

### Nginx Configuration

The `nginx.conf` file configures:

- **Listen Port**: 80
- **Root Directory**: `/usr/share/nginx/html`
- **SPA Routing**: All routes fallback to `index.html` for Angular routing support

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

## CI/CD Pipeline (Jenkins)

### Pipeline Overview

The Jenkins pipeline (`Jenkinsfile`) implements a complete CI/CD workflow with the following stages:

### Environment Variables

```groovy
IMAGE_NAME     = "wagihh/pms-admin-frontend"
STACK_NAME     = "pms-admin"
SERVICE_NAME   = "admin-frontend"
BUILD_IMAGE    = "${IMAGE_NAME}:${BUILD_NUMBER}"
LATEST_IMAGE   = "${IMAGE_NAME}:latest"
```

### Pipeline Stages

#### 1. Checkout Stage
- Clones the repository from GitHub
- Uses branch: `main`
- Requires credentials: `github-pat-wagih`

#### 2. Verify Docker Swarm Stage
- Validates that Docker Swarm is active
- Exits with error if Swarm is not initialized

#### 3. Docker Login Stage
- Authenticates with Docker Hub
- Uses credentials: `Docker-PAT`
- Required for pushing images

#### 4. Save Previous Image Stage
- Captures the current running image tag
- Used for rollback in case of deployment failure

#### 5. Build Docker Image Stage
- Builds Docker image with build number tag
- Tags image as `latest`
- Image name: `wagihh/pms-admin-frontend:${BUILD_NUMBER}`

#### 6. Deploy to Docker Swarm Stage
- Deploys using Docker Stack
- Uses `docker-compose.yml` configuration
- Sets `IMAGE_TAG` environment variable

#### 7. Health Check Stage
- Waits 10 seconds for service to stabilize
- Verifies at least one replica is running
- Uses Docker Swarm native health checks

### Post-Actions

#### On Failure
- Automatically rolls back to previous image
- Uses the saved `PREVIOUS_IMAGE` variable
- Redeploys stack with previous image tag

#### On Success
- Logs successful deployment message

## Deployment Architecture

### Docker Swarm Deployment

The application is deployed as a Docker Swarm stack:

```bash
docker stack deploy -c docker-compose.yml pms-admin
```

**Stack Components**:
- Stack Name: `pms-admin`
- Service Name: `admin-frontend`
- Network: `pms-network` (must exist externally)
- Replicas: 2 (for high availability)

### Network Configuration

The application requires an external Docker network:

```bash
docker network create --driver overlay pms-network
```

This network should be created before deploying the stack.

## Build Process

### Local Build

```bash
# Build Docker image
docker build -t pms-admin-frontend:latest .

# Tag for registry
docker tag pms-admin-frontend:latest wagihh/pms-admin-frontend:latest
```

### Production Build

The build process:
1. Installs dependencies using `npm ci` (clean install)
2. Copies all source files
3. Runs `npm run build` (Angular production build)
4. Outputs to `dist/admin/browser`
5. Packages into nginx container

## Image Management

### Image Tagging Strategy

- **Build Number**: `wagihh/pms-admin-frontend:${BUILD_NUMBER}`
- **Latest**: `wagihh/pms-admin-frontend:latest`

### Image Registry

- **Registry**: Docker Hub
- **Repository**: `wagihh/pms-admin-frontend`
- **Authentication**: Uses Jenkins credentials `Docker-PAT`

## Monitoring and Health Checks

### Health Check Implementation

The pipeline uses Docker Swarm native health checks:

```bash
docker service ps ${STACK_NAME}_${SERVICE_NAME} \
  --filter "desired-state=running" \
  --format "{{.CurrentState}}" | grep Running
```

### Service Status Verification

- Checks running replicas count
- Validates service state
- Fails deployment if service is not running

## Rollback Strategy

### Automatic Rollback

If deployment fails:
1. Pipeline captures previous image tag
2. Automatically redeploys with previous image
3. Ensures zero-downtime rollback

### Manual Rollback

```bash
# Deploy specific image version
IMAGE_TAG=wagihh/pms-admin-frontend:123 docker stack deploy -c docker-compose.yml pms-admin
```

## Netlify Configuration

The `netlify.toml` file provides alternative deployment option:

- **Build Command**: `npm run build`
- **Publish Directory**: `dist/admin/browser`
- **Redirects**: All routes redirect to `index.html` (SPA support)
- **Node Version**: 20

## Security Considerations

### Docker Security

- Uses Alpine Linux base images (minimal attack surface)
- Multi-stage build reduces final image size
- No root user execution in runtime stage

### Credentials Management

- GitHub credentials stored in Jenkins: `github-pat-wagih`
- Docker Hub credentials stored in Jenkins: `Docker-PAT`
- Never commit credentials to repository

## Scaling Configuration

### Horizontal Scaling

- Current replicas: 2
- Can be adjusted in `docker-compose.yml`:
  ```yaml
  deploy:
    replicas: 3  # Increase for more instances
  ```

### Load Balancing

Docker Swarm provides built-in load balancing across replicas.

## Troubleshooting

### Docker Swarm Issues

```bash
# Check Swarm status
docker info --format '{{.Swarm.LocalNodeState}}'

# Initialize Swarm (if not active)
docker swarm init
```

### Service Debugging

```bash
# View service logs
docker service logs pms-admin_admin-frontend

# Inspect service
docker service inspect pms-admin_admin-frontend

# List service tasks
docker service ps pms-admin_admin-frontend
```

### Image Issues

```bash
# List images
docker images wagihh/pms-admin-frontend

# Remove old images
docker image prune -a
```

## Best Practices

1. **Always tag images** with build numbers for traceability
2. **Use external networks** for service communication
3. **Implement health checks** for reliable deployments
4. **Maintain rollback capability** for quick recovery
5. **Monitor service logs** for debugging
6. **Keep base images updated** for security patches

## Environment Variables

### Build Time
- `NODE_VERSION`: 20 (from netlify.toml)

### Runtime
- `IMAGE_TAG`: Docker image tag for deployment

## References

- [Docker Documentation](https://docs.docker.com/)
- [Docker Swarm Documentation](https://docs.docker.com/engine/swarm/)
- [Jenkins Pipeline Documentation](https://www.jenkins.io/doc/book/pipeline/)
- [Nginx Configuration](https://nginx.org/en/docs/)

