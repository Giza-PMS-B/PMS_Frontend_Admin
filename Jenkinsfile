pipeline {
    agent any

    environment {
        FRONTEND_DIR = "frontend"
        ANGULAR_BUILD_DIR = "${WORKSPACE}/${FRONTEND_DIR}/dist/admin/browser"
    }

    stages {

        stage('Checkout Admin Frontend') {
            steps {
                dir("${FRONTEND_DIR}") {
                    git(
                        url: 'https://github.com/Giza-PMS-B/PMS_Frontend_Admin.git',
                        branch: 'main',
                        credentialsId: 'github-pat-wagih'
                    )
                }
            }
        }

        stage('Build Angular (Admin)') {
            steps {
                dir("${FRONTEND_DIR}") {
                    sh 'npm install'
                    sh 'npm run build -- --base-href=/admin/'
                }
            }
        }

        stage('Deploy Admin') {
            steps {
                sh '''
                  sudo ANGULAR_BUILD_DIR=${ANGULAR_BUILD_DIR} \
                  ./deployAdmin.sh
                '''
            }
        }
    }
}
