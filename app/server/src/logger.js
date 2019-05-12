const winston = require('winston')
const colors = require('colors')
const path = require('path')

const { createLogger, format, transports } = winston
const { combine, timestamp, label, printf, colorize } = format

const myFormat = printf(info => `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`)

const logger = createLogger({
  format: combine(
    label({ label: colors.red('EthBnB') }),
    timestamp(),
  ),
  transports: [
    new transports.Console({
      format: combine(
        colorize(),
        myFormat,
      ),
      level: 'silly',
      prettyPrint: obj => JSON.stringify(obj),
    }),
    // new transports.File({ format: myFormat, filename:
    //    path.resolve(logDir, 'info.log'), level: 'info' }),
    // new transports.File({ format: myFormat, filename:
    //    path.resolve(logDir, 'error.log'), level: 'error' })
  ],
})

module.exports = logger
