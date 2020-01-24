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
          dir('truffle/') {
            /* Compile smart-contract */
            sh('truffle compile')
          }
        }
      }

      stage('Test Smart-Contract') {
        steps {
            sh ('rm -rf truffle/build/')
            /* Run smart-contract tests */
            sh('./scripts/truffle-test.sh')
          }
      }

      stage('Coverage Smart-Contract') {
        steps {
          dir('truffle/') {
            sh('npx solidity-coverage')
          }
        }
      }

      stage('Client Vulnerability check') {
         steps {
          dir('frontend/') {
            sh('npm audit || true')
          }
        }
      }

      stage('Client Code Linting') {
        steps {
          dir('frontend/') {
            /* Run Eslint but make sure it doesn't force build failure */
            sh('eslint --config .eslintrc.json --ext .jsx  --format html -o eslint-output.html src/ || true')
          }
        }
      }

      stage('Server Vulnerability Check') {
        steps {
          dir('backend/') {
            sh('npm audit || true')
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