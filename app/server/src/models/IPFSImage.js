var mongoose = require('mongoose')
var Schema   = mongoose.Schema
var ObjectId = Schema.ObjectId

var IPFSImage = mongoose.model('ipfs_images', new Schema({
  path: { type: String }, 
  hash: { type: String, unique: true, required: true},
  size: Number, 
}))

module.exports = IPFSImage
