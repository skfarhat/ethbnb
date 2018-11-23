const express = require('express')
const bodyParser = require('body-parser')

const app = express()
// Support application/json type post data
app.use(bodyParser.json())
// Support application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: false }))

module.exports = app
