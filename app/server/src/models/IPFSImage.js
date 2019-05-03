const mongoose = require('mongoose')
const Schema = mongoose.Schema

const IPFSImage = mongoose.model('ipfs_images', new Schema({
  path: { type: String },
  hash: { type: String, unique: true, required: true },
  size: Number,
}))

module.exports = IPFSImage
