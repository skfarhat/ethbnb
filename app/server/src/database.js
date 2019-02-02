const mongoose = require('mongoose')
const Listing = require('./models/Listing')

module.exports = class Database {

  constructor(options) {
    this.options = options
    logger.info(JSON.stringify(options))
    this.connect_str = format("mongodb://{host}:{port}/{db_name}", options)
    console.log(this.connect_str)
    // Models
    this.Listing = Listing;
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
