const mongoose = require('mongoose')

module.exports = class Database {

  constructor(options) {
    this.options = options
    this.connectOpts = {
      newUrlParser: true, 
      autoReconnect: true,
    }
    this.connect_str = format("mongodb://{host}:{port}/{db_name}", options)
  }

  async connectSync() {
    return new Promise(resolve => {
      mongoose.connection.on('error', (e) => {
        logger.error('Failed to connect to mongoose', e)
        resolve(false)
      })
      mongoose.connection.on('open', () => {
        logger.info('Connected to database')
        resolve(true)
      })
      mongoose.connect(this.connect_str, this.connectOpts);
    })
  }
  
  connect() {
    mongoose.connection.on('error', (e) => {
      logger.error('Failed to connect to mongoose', e)
    })
    mongoose.connection.on('open', () => {
      logger.info('Connected to database')
    })
    mongoose.connect(this.connect_str, this.connectOpts);
  }
}
