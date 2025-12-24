pipeline {
    agent any

    triggers {
        pollSCM('H/2 * * * *')
    }

    environment {
        DOCKER_REPO    = "wagihh/pms-admin-frontend"
        CONTAINER_NAME = "admin-frontend"
        APP_PORT       = "8085"

        BUILD_IMAGE    = "${DOCKER_REPO}:${BUILD_NUMBER}"
        LATEST_IMAGE   = "${DOCKER_REPO}:latest"
        PREVIOUS_IMAGE = ""
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

        stage('Save Previous Image') {
            steps {
                script {
                    PREVIOUS_IMAGE = sh(
                        script: "docker inspect ${CONTAINER_NAME} --format '{{.Config.Image}}' || true",
                        returnStdout: true
                    ).trim()
                }
            }
        }

        stage('Docker Login') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'Docker-Patt',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
                    sh '''
                      echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                    '''
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                sh """
                  docker build -t ${BUILD_IMAGE} .
                  docker tag ${BUILD_IMAGE} ${LATEST_IMAGE}
                """
            }
        }

        stage('Push Docker Images') {
            steps {
                sh """
                  docker push ${BUILD_IMAGE}
                  docker push ${LATEST_IMAGE}
                """
            }
        }

        stage('Deploy Frontend (Docker Run)') {
            steps {
                sh """
                  docker rm -f ${CONTAINER_NAME} || true

                  docker run -d \
                    --name ${CONTAINER_NAME} \
                    -p ${APP_PORT}:80 \
                    ${BUILD_IMAGE}
                """
            }
        }

        stage('Health Check') {
            steps {
                sh '''
                  sleep 5
                  curl -f http://localhost:8085 || exit 1
                '''
            }
        }
    }

    post {
        failure {
            echo "❌ Deployment failed — rolling back"

            script {
                if (PREVIOUS_IMAGE?.trim()) {
                    sh """
                      docker rm -f ${CONTAINER_NAME} || true
                      docker run -d \
                        --name ${CONTAINER_NAME} \
                        -p ${APP_PORT}:80 \
                        ${PREVIOUS_IMAGE}
                    """
                } else {
                    echo "No previous image found — rollback skipped"
                }
            }
        }

        success {
            echo "✅ Admin Frontend built, pushed, and deployed successfully"
        }
    }
}
