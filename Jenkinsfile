pipeline {
    agent any

    triggers {
        pollSCM('H/2 * * * *')
    }

    environment {
        IMAGE_NAME   = "pms-admin-frontend"
        IMAGE_LATEST = "pms-admin-frontend:latest"
        STACK_NAME   = "pms"
        SERVICE_NAME = "admin-frontend"
        APP_PORT     = "8085"
    }

    stages {

        stage('Checkout Admin Frontend') {
            steps {
                git(
                    url: 'https://github.com/Giza-PMS-B/PMS_Frontend_Admin.git',
                    branch: 'deploying',
                    credentialsId: 'github-pat-wagih'
                )
            }
        }

        stage('Verify Docker Swarm') {
            steps {
                sh '''
                  STATE=$(docker info --format '{{.Swarm.LocalNodeState}}')

                  if [ "$STATE" != "active" ]; then
                    echo "ERROR: Docker Swarm is not initialized on this host"
                    echo "Run: docker swarm init (once, manually)"
                    exit 1
                  fi
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                  docker build -t ${IMAGE_LATEST} .
                '''
            }
        }

        stage('Deploy to Docker Swarm') {
            steps {
                sh '''
                  docker stack deploy -c docker-compose.yml ${STACK_NAME}
                '''
            }
        }

        stage('Health Check') {
            steps {
                sh '''
                  sleep 10
                  curl -f http://localhost:${APP_PORT}
                '''
            }
        }
    }

    post {
        success {
            echo "✅ Admin Frontend deployed successfully"
        }
        failure {
            echo "❌ Deployment failed"
        }
    }
}
