pipeline {
  agent any

  stages {

      stage('Setup') {
        steps {
          sh('npm install')
        }
      }

      stage('Build smart-contract') {
        steps {
          /* Compile smart-contract */ 
          sh('truffle compile')
        }
      }

      stage('Test smart-contract') {
        steps {
          /* Run smart-contract tests */ 
          sh('truffle test')
        }
      }

      stage('Run coverage on smart-contract') {
        steps {
          /* Run coverage */ 
          /* NOTE: this step may be redundant to previous `truffle test` call */ 
          sh('./node_modules/.bin/solidity-coverage')
        }
      }

      stage('Lint Client JavaScript code') {
        steps {
          dir('app/client') {
            /* Run Eslint but make sure it doesn't force build failure */ 
            sh('eslint --config .eslintrc.json --ext .jsx  --format html -o eslint-output.html src/ || true') 
          }
        }
      }

      stage('Publish Reports') {
        steps {
          /* Publish Coverage report */ 
          publishHTML([
              allowMissing: true,
              alwaysLinkToLastBuild: true,
              keepAll: true,
              reportDir: 'coverage',
              reportFiles: 'index.html',
              reportName: 'Smart-Contract Coverage Report',
              reportTitles: ''
            ])

          /* Publish Eslint output */
          publishHTML (target: [
              allowMissing: true,
              alwaysLinkToLastBuild: false,
              keepAll: true,
              reportDir: './',
              reportFiles: 'eslint-output.html',
              reportName: "Eslint Report"
            ])
        }
      }

    }

}