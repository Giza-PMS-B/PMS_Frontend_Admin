pipeline {
    agent any

    environment {
        IMAGE_NAME     = "wagihh/pms-admin-frontend"
        STACK_NAME     = "pms-admin"
        SERVICE_NAME   = "admin-frontend"

        BUILD_IMAGE    = "${IMAGE_NAME}:${BUILD_NUMBER}"
        LATEST_IMAGE   = "${IMAGE_NAME}:latest"
        PREVIOUS_IMAGE = ""
    }

    stages {

        stage('Checkout Admin Frontend') {
            steps {
                git(
                    url: 'https://github.com/Giza-PMS-B/PMS_Frontend_Admin.git',
                    branch: 'main',
                    credentialsId: 'github-pat-wagih'
                )
            }
        }

        stage('Verify Docker Swarm') {
            steps {
                sh '''
                  STATE=$(docker info --format '{{.Swarm.LocalNodeState}}')
                  if [ "$STATE" != "active" ]; then
                    echo "Docker Swarm is not active"
                    exit 1
                  fi
                '''
            }
        }

        stage('Docker Login') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'Docker-PAT',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                      echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                    '''
                }
            }
        }

        stage('Save Previous Image') {
            steps {
                script {
                    PREVIOUS_IMAGE = sh(
                        script: "docker service inspect ${STACK_NAME}_${SERVICE_NAME} --format '{{.Spec.TaskTemplate.ContainerSpec.Image}}' || true",
                        returnStdout: true
                    ).trim()
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

        stage('Deploy to Docker Swarm') {
            steps {
                sh """
                  IMAGE_TAG=${BUILD_IMAGE} docker stack deploy -c docker-compose.yml ${STACK_NAME}
                """
            }
        }

        stage('Health Check (Swarm Native)') {
            steps {
                sh '''
                  sleep 10
                  RUNNING=$(docker service ps ${STACK_NAME}_${SERVICE_NAME} \
                    --filter "desired-state=running" \
                    --format "{{.CurrentState}}" | grep Running | wc -l)

                  if [ "$RUNNING" -lt 1 ]; then
                    echo "Service is not running"
                    exit 1
                  fi
                '''
            }
        }
    }

    post {
        failure {
            echo "❌ Admin Frontend deployment failed — rolling back"
            script {
                if (PREVIOUS_IMAGE?.trim()) {
                    sh """
                      IMAGE_TAG=${PREVIOUS_IMAGE} docker stack deploy -c docker-compose.yml ${STACK_NAME}
                    """
                }
            }
        }

        success {
            echo "✅ Admin Frontend deployed successfully"
        }
    }
}
