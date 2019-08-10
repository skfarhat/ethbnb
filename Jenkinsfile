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

      stage('Test Smart-Contract') {
        steps {
          sh ('rm -rf build/')
          /* Run smart-contract tests */
          sh('truffle test')
        }
      }

      stage('Coverage Smart-Contract') {
        steps {
          /* Run coverage */
          /* NOTE: this step may be redundant to previous `truffle test` call */
          sh('rm -rf build/; ./node_modules/.bin/solidity-coverage')
        }
      }

      stage('Client Vulnerability check') {
         steps {
          dir('app/client') {
            sh('npm audit')
          }
        }
      }

      stage('Client Code Linting') {
        steps {
          dir('app/client') {
            /* Run Eslint but make sure it doesn't force build failure */
            sh('eslint --config .eslintrc.json --ext .jsx  --format html -o eslint-output.html src/ || true')
          }
        }
      }

      stage('Server Vulnerability Check') {
        steps {
          dir('app/server') {
            sh('npm audit')
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