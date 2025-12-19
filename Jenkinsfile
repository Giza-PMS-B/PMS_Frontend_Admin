pipeline {
    agent any

    triggers {
        pollSCM('H/2 * * * *')
    }

    environment {
        IMAGE_NAME = "pms-admin-frontend"
        IMAGE_LATEST = "pms-admin-frontend:latest"
        STACK_NAME = "pms"
        SERVICE_NAME = "admin-frontend"
        APP_PORT = "8085"
    }

    stages {

        stage('Checkout Admin Frontend') {
            steps {
                git(
                    url: 'https://github.com/Giza-PMS-B/PMS_Frontend_Admin.git',
                    branch: 'feature/docker-swarm',
                    credentialsId: 'github-pat-wagih'
                )
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                  docker build -t ${IMAGE_LATEST} .
                '''
            }
        }

        stage('Init Docker Swarm (If Not Initialized)') {
            steps {
                sh '''
                  docker info | grep -q "Swarm: active" || docker swarm init
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
                  curl -f http://localhost:${APP_PORT} || exit 1
                '''
            }
        }
    }

    post {
        success {
            echo "✅ Admin Frontend deployed using Docker Swarm with 3 replicas & load balancing"
        }

        failure {
            echo "❌ Deployment failed"
        }
    }
}

