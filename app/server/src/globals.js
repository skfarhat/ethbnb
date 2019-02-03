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
module.exports = () => {
  global.format = require('string-format')
  global.logger = require('./logger')
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
