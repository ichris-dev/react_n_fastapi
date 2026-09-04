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
                bat 'docker compose -f docker-compose.test.yml down -v'
                bat 'docker compose -f docker-compose.test.yml up -d'
                bat 'ping -n 9 127.0.0.1 > nul'
            }
        }

        stage('Backend: Install & Test') {
            steps {
                dir('project_backend') {
                    bat 'C:\\Users\\timot\\AppData\\Local\\Programs\\Python\\Python310\\python.exe -m venv venv'
                    bat 'venv\\Scripts\\python.exe -m pip install --upgrade pip'
                    bat 'venv\\Scripts\\pip install -r requirements.txt'
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
                bat 'docker build -t impanochrispe/react-projects-api:%BUILD_NUMBER% -t impanochrispe/react-projects-api:latest ./project_backend'
                bat 'docker build -t impanochrispe/react-projects-web:%BUILD_NUMBER% -t impanochrispe/react-projects-web:latest ./learn_react'
            }
        }

        stage('Smoke Test Locally') {
            steps {
                bat 'docker compose down -v'
                bat 'docker compose up -d --build'
                bat 'ping -n 16 127.0.0.1 > nul'
                bat 'docker compose ps'
                bat 'docker compose logs api'
                bat 'docker compose logs db'
                bat 'curl -f http://localhost:8000/docs'
                bat 'curl -f http://localhost:3000'
            }
        }

        stage('Push Images') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'fd8e91e0-b3d3-4f6a-9e16-30d62e53749c', usernameVariable: 'DOCKERHUB_USER', passwordVariable: 'DOCKERHUB_PASS')]) {
                    bat 'docker login -u %DOCKERHUB_USER% -p %DOCKERHUB_PASS%'
                    bat 'docker push impanochrispe/react-projects-api:%BUILD_NUMBER%'
                    bat 'docker push impanochrispe/react-projects-api:latest'
                    bat 'docker push impanochrispe/react-projects-web:%BUILD_NUMBER%'
                    bat 'docker push impanochrispe/react-projects-web:latest'
                }
            }
        }
    }

    post {
        always {
            echo "Build #${env.BUILD_NUMBER} finished: ${currentBuild.currentResult}"
            bat 'docker logout'
        }
    }
}
