/**
 * Sets up global variables for the project
 *
 * This should be required by scripts using any of the components, as
 * the components expect those globals to be defined.
 *
 * No application or business-logic variables will be stored here,
 * merely function declarations that can make it easier to code the
 * rest of the project without having to abuse requires
 * (and relative requires).
 */
const logger = require('./logger')

module.exports = () => {
  global.logger = logger
  global.hasKey = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key)
  global.setMongoDate = dateSec => parseInt(dateSec, 10) * 1000
  global.sleep = waitTimeInMs => new Promise(resolve => setTimeout(resolve, waitTimeInMs))
  global.isSet = val => val !== null && typeof (val) !== 'undefined'
  global.constants = {
    PORT: 3001,
    PROVIDER_HTTP: 'http://localhost:8545',
    PROVIDER_WS: 'ws://localhost:8545',
    db: {
      db_name: 'ethbnb',
      host: 'localhost',
      port: 27017,
    },
  }
}
