// Run with local daemon
import ipfsApi from 'ipfs-api'
const IPFS = new ipfsApi('localhost', '5001', {protocol:'http'});
export default IPFS
