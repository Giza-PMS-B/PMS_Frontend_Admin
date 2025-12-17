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

        stage('Checkout Infra') {
            steps {
                dir("infra") {
                    git(
                        url: 'https://github.com/Omar-Eldamaty/Giza-Systems-FP.git',
                        branch: 'main',
			credentialsId: 'github-pat-wagih'
                    )
                }
            }
        }

        stage('Deploy Admin') {
            steps {
                sh '''
                  export ANGULAR_BUILD_DIR=${ANGULAR_BUILD_DIR}
                  ansible-playbook infra/deploy.yml \
                    -e deploy_script=infra/deployAdmin.sh
                '''
            }
        }
    }
}
