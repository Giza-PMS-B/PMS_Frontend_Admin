pipeline {
    agent any

    triggers {
        pollSCM('H/2 * * * *')   // check every 2 minutes
    }

    environment {
        IMAGE_NAME = "pms-admin-frontend"
        IMAGE_LATEST = "pms-admin-frontend:latest"
        IMAGE_BACKUP = "pms-admin-frontend:previous"
        CONTAINER_NAME = "pms-admin-frontend"
        APP_PORT = "8085"
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

        stage('Backup Current Image (Rollback Prep)') {
            steps {
                sh '''
                  if docker image inspect ${IMAGE_LATEST} > /dev/null 2>&1; then
                      echo "Backing up current image"
                      docker tag ${IMAGE_LATEST} ${IMAGE_BACKUP}
                  else
                      echo "No previous image found"
                  fi
                '''
            }
        }

        stage('Build Docker Image (Angular + NGINX)') {
            steps {
                sh '''
                  docker build -t ${IMAGE_LATEST} .
                '''
            }
        }

        stage('Deploy Admin Frontend Container') {
            steps {
                sh '''
                  set -e

                  docker rm -f ${CONTAINER_NAME} || true

                  docker run -d \
                    --name ${CONTAINER_NAME} \
                    -p ${APP_PORT}:80 \
                    ${IMAGE_LATEST}
                '''
            }
        }

        stage('Health Check') {
            steps {
                sh '''
                  sleep 5
                  curl -f http://localhost:${APP_PORT} || exit 1
                '''
            }
        }
    }

    post {
        success {
            echo "✅ Admin Frontend deployed successfully on port ${APP_PORT}"
        }

        failure {
            echo "❌ Deployment failed — rolling back"

            sh '''
              docker rm -f ${CONTAINER_NAME} || true

              if docker image inspect ${IMAGE_BACKUP} > /dev/null 2>&1; then
                  docker run -d \
                    --name ${CONTAINER_NAME} \
                    -p ${APP_PORT}:80 \
                    ${IMAGE_BACKUP}
                  echo "🔁 Rollback completed"
              else
                  echo "⚠️ No backup image available — rollback skipped"
              fi
            '''
        }
    }
}

