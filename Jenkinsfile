pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Test Docker') {
            steps {
                bat '''
                    where docker
                    docker --version
                    docker compose version
                    docker info
                '''
            }
        }

        stage('Start Test Database') {
            steps {
                bat 'docker compose -f docker-compose.test.yml up -d'
                bat 'timeout /t 8'
            }
        }

        stage('Backend: Install & Test') {
            steps {
                dir('project_backend') {
                    bat 'python -m venv venv'
                    bat 'venv\\Scripts\\pip install --upgrade pip'
                    bat 'venv\\Scripts\\pip install -r requirements.txt'
                    bat 'venv\\Scripts\\pip install pytest pytest-asyncio httpx'
                    bat 'venv\\Scripts\\pytest -v --junitxml=test-results.xml'
                }
            }
            post {
                always {
                    junit 'project_backend/test-results.xml'
                    bat 'docker compose -f docker-compose.test.yml down -v'
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                bat 'docker build -t %DOCKERHUB_USER%/react-projects-api:%BUILD_NUMBER% -t %DOCKERHUB_USER%/react-projects-api:latest ./project_backend'
                bat 'docker build -t %DOCKERHUB_USER%/react-projects-web:%BUILD_NUMBER% -t %DOCKERHUB_USER%/react-projects-web:latest ./learn_react'
            }
        }

        stage('Smoke Test Locally') {
            steps {
                bat 'docker compose down'
                bat 'docker compose up -d --build'
                bat 'timeout /t 10'
                bat 'curl -f http://localhost:8000/docs'
                bat 'curl -f http://localhost:3000'
            }
        }

        stage('Push Images') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKERHUB_USER', passwordVariable: 'DOCKERHUB_PASS')]) {
                    bat 'echo %DOCKERHUB_PASS% | docker login -u %DOCKERHUB_USER% --password-stdin'
                    bat 'docker push %DOCKERHUB_USER%/react-projects-api:%BUILD_NUMBER%'
                    bat 'docker push %DOCKERHUB_USER%/react-projects-api:latest'
                    bat 'docker push %DOCKERHUB_USER%/react-projects-web:%BUILD_NUMBER%'
                    bat 'docker push %DOCKERHUB_USER%/react-projects-web:latest'
                }
            }
        }
    }

    post {
        always {
            echo "Build #${env.BUILD_NUMBER} finished: ${currentBuild.currentResult}"
        }
    }
}