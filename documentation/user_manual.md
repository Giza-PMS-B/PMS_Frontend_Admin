# User Script Guide - DevOps

This document provides step-by-step instructions for deploying the PMS Frontend Admin application using Docker.

## Prerequisites

Before deploying the application, ensure you have the following installed:

- **Docker** (version 20.10 or higher)
- **Docker Compose** (version 2.0 or higher)

## Docker Deployment

### Option 1: Using Docker Compose

1. **Build and Run with Docker Compose**

   ```bash
   docker-compose up -d
   ```

   The application will be available at `http://localhost:8085`

2. **Stop the Application**

   ```bash
   docker-compose down
   ```

3. **View Logs**

   ```bash
   docker-compose logs -f admin-frontend
   ```

### Option 2: Using Docker Directly

1. **Build the Docker Image**

   ```bash
   docker build -t pms-admin-frontend:latest .
   ```

2. **Run the Container**

   ```bash
   docker run -d -p 8085:80 --name pms-admin pms-admin-frontend:latest
   ```

3. **Stop and Remove the Container**

   ```bash
   docker stop pms-admin
   docker rm pms-admin
   ```

## Docker Swarm Deployment

For production deployments using Docker Swarm:

1. **Ensure Docker Swarm is initialized**

   ```bash
   docker swarm init
   ```

2. **Create the required network**

   ```bash
   docker network create --driver overlay pms-network
   ```

3. **Deploy the stack**

   ```bash
   IMAGE_TAG=pms-admin-frontend:latest docker stack deploy -c docker-compose.yml pms-admin
   ```

4. **Check service status**

   ```bash
   docker service ls
   docker service ps pms-admin_admin-frontend
   ```

5. **View service logs**

   ```bash
   docker service logs pms-admin_admin-frontend
   ```

6. **Remove the stack**

   ```bash
   docker stack rm pms-admin
   ```

## Troubleshooting

### Docker Build Issues

If you encounter issues building the Docker image:

1. Ensure Docker is running
2. Check that all files are present
3. Verify network connectivity for pulling base images

### Docker Swarm Issues

If you encounter issues with Docker Swarm:

1. **Check Swarm status**
   ```bash
   docker info --format '{{.Swarm.LocalNodeState}}'
   ```

2. **Verify network exists**
   ```bash
   docker network ls | grep pms-network
   ```

3. **Check service status**
   ```bash
   docker service inspect pms-admin_admin-frontend
   ```

### Container Issues

If containers fail to start:

1. **Check container logs**
   ```bash
   docker logs pms-admin
   ```

2. **Verify port availability**
   ```bash
   # Check if port 8085 is in use
   lsof -i :8085
   ```

3. **Inspect container**
   ```bash
   docker inspect pms-admin
   ```

## Accessing the Application

- **Docker Compose Deployment**: `http://localhost:8085`
- **Docker Direct Deployment**: `http://localhost:8085`
- **Docker Swarm Deployment**: Configure according to your Swarm setup

## Additional Resources

- For detailed technical DevOps documentation, see `DEVOPS_TECHNICAL.md`

