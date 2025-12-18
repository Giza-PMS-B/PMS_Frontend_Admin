pipeline {
    agent any

    environment {
        IMAGE_NAME = "pms-admin-frontend"
        CONTAINER_NAME = "pms-admin-frontend"
    }

    stages {

        stage('Checkout Admin Frontend') {
            steps {
                git(
                    url: 'https://github.com/Giza-PMS-B/PMS_Frontend_Admin.git',
                    branch: 'pipeline-+-dockerization',
                    credentialsId: 'github-pat-wagih'
                )
            }
        }

        stage('Build Docker Image (Angular + NGINX)') {
            steps {
                sh '''
                  docker build -t ${IMAGE_NAME}:latest .
                '''
            }
        }

        stage('Deploy Admin Frontend Container') {
            steps {
                sh '''
                  docker rm -f ${CONTAINER_NAME} || true
                  docker run -d \
                    --name ${CONTAINER_NAME} \
                    -p 8085:80 \
                    ${IMAGE_NAME}:latest
                '''
            }
        }
    }

    post {
        success {
            echo "✅ Admin Frontend deployed successfully on port 80"
        }
        failure {
            echo "❌ Admin Frontend deployment failed"
        }
    }
}

