const mongoose = require('mongoose')

module.exports = class Database {

  constructor(options) {
    this.options = options
    this.connect_str = format("mongodb://{host}:{port}/{db_name}", options)
  }
  connect() {
    const connectOpts = {
      newUrlParser: true, 
      autoReconnect: true,
    }
    mongoose.connection.on('error', (e) => {
      logger.error('Failed to connect to mongoose', e)
    })
    mongoose.connection.on('open', () => {
      logger.info('Connected to database')
    })
    mongoose.connect(this.connect_str, connectOpts);
  }
}
