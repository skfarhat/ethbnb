// Run with local daemon
import ipfsApi from 'ipfs-api'
import buffer from 'buffer'
import log from '../logger'

const ipfs = new ipfsApi('localhost', '5001', { protocol: 'http' })

// Uploads the image to IPFS and modifies the state with the returned hash
const ipfsFileUpload = async (file) => {
  console.log('ipfsFileUpload', file)
  const reader = new FileReader()

  return new Promise(((fulfill, reject) => {
    // Get the uploaded file image
    reader.onloadend = async () => {
      // Convert data into buffer
      const buf = buffer.Buffer(reader.result)
      try {
      // Upload buffer to IPFS
        const result = await ipfs.files.add(buf)
        fulfill(result[0].hash)
      } catch (err) {
        log.error('IPFS: ipfsFileUpload - exception thrown with error ', err)
        reject(err)
      }
    }
    // Read Provided File
    reader.readAsArrayBuffer(file) 
  }))
}

export {
  ipfs,
  ipfsFileUpload,
}
