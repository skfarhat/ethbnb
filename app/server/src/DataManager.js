//
// Sami Farhat
//

// ============================================================
// REQUIRE
// ============================================================

require('./globals')()
const Web3 = require('web3')
const fs = require('fs')
const path = require('path')
const ipfsAPI = require('ipfs-api')
const Listings = require('./models/Listing')
const IPFSImage = require('./models/IPFSImage')

// ============================================================
// DEFINITIONS
// ============================================================

// Convenience function
//
// Returns seconds timestamp of date in Feb 2019
// e.g.
// feb2019(10) returns the timestamp of 10/02/2019 which is 1549756800
// day_nb = [1..28]
const feb2019 = dayNb => new Date(`2019-02-${dayNb}`).getTime() / 1000

// Directory path to listing images
const LISTING_IMGS_PATH = path.join(__dirname, 'imgs/listings')

const chainTransactions = [
  // ============================================
  // ACCOUNTS
  // ============================================
  {
    name: 'createAccount',
    inputs: [{ value: 'Host1' }],
    constant: false,
    clientIndex: 0,
  },
  {
    name: 'createAccount',
    inputs: [{ value: 'Host2' }],
    constant: false,
    clientIndex: 1,
  },
  {
    name: 'createAccount',
    inputs: [{ value: 'Guest1' }],
    constant: false,
    clientIndex: 2,
  },
  {
    name: 'createAccount',
    inputs: [{ value: 'Guest2' }],
    constant: false,
    clientIndex: 3,
  },
  // ============================================
  // LISTINGS
  // ============================================
  {
    // owner: Host1
    // lid: 1
    clientIndex: 0,
    name: 'createListing',
    inputs: [
      { value: 65/* GB */, name: 'country' },
      { value: 'Cambridge', name: 'location' },
      { value: 600, name: 'price' },
    ],
    constant: false,
    metadata: {
      title: '53 Devonshire-on-Rails',
      description: 'Welcome to the super awesome Devonshire place.',
      images: ['1.jpg'],
    },
  },
  {
    // owner: Host1
    // lid: 2
    clientIndex: 0,
    name: 'createListing',
    inputs: [
      { value: '65'/* GB */, name: 'country' },
      { value: 'London', name: 'location' },
      { value: '1799', name: 'price' },
    ],
    constant: false,
    metadata: {
      title: 'London Victorian House',
      description: `Good sized, basic double room in a 3 bed Shared flat situated in the heart of Holborn,
    East Central London. The flat comprises of a fitted kitchen and a shared bathroom.`,
      images: ['3.jpg'],
    },
  },
  {
    // owner: Host2
    // lid: 3
    clientIndex: 1,
    name: 'createListing',
    inputs: [
      { value: '75'/* FR */, name: 'country' },
      { value: 'Paris', name: 'location' },
      { value: '2000', name: 'price' },
    ],
    constant: false,
    metadata: {
      title: 'Lovely house at Croissy-Sur-Seine',
      description: `Ouvry Manor - big place - jakuzzi - sauna - lovely spaceous garden - big DIY garage - 4 bedrooms
    and BABY-FOOT`,
      images: ['2.jpeg'],
    },
  },
  {
    // owner: Host2
    // lid: 4
    clientIndex: 1,
    name: 'createListing',
    inputs: [
      { value: '118'/* LB */, name: 'country' },
      { value: 'Beirut', name: 'location' },
      { value: '700', name: 'price' },
    ],
    constant: false,
    metadata: {
      title: 'Beirut Central',
      description: 'Lovely house',
    },
  },
  {
    // owner: Host2
    // lid: 5
    clientIndex: 1,
    name: 'createListing',
    inputs: [
      { value: '118'/* LB */, name: 'country' },
      { value: 'Saida', name: 'location' },
      { value: '300', name: 'price' },
    ],
    constant: false,
    metadata: {
      title: 'Sidon Castle',
      description: 'Lovely Saida residence next to Ain-el-Helwe. Stay next door to the lovely Im Wassim.',
    },
  },
  // ============================================
  // BOOKINGS
  // ============================================
  {
    // Guest1 -> Host1
    // lid: 1 (Cambridge)
    // bid: 0
    // booked for 3 days: 10/02/2019 to 13/02/2019
    clientIndex: 2,
    name: 'listingBook',
    inputs: [
      { value: 1, name: 'listingId' },
      { value: feb2019(10), name: 'fromDate' },
      { value: 3, name: 'nb_days' },
    ],
    constant: false,
  },
  {
    // Guest1 -> Host1
    // lid: 3 (Paris)
    // bid: 1
    // booked for 4 days: 16/02/2019 to 20/02/2019
    clientIndex: 2,
    name: 'listingBook',
    inputs: [
      { value: 3, name: 'listingId' },
      { value: feb2019(16), name: 'fromDate' },
      { value: 4, name: 'nb_days' },
    ],
    constant: false,
  },
  {
    // Guest2 -> Host1
    // lid: 1 (Cambridge)
    // bid: 1
    // booked for 4 days: 16/02/2019 to 20/02/2019
    clientIndex: 3,
    name: 'listingBook',
    inputs: [
      { value: 1, name: 'listingId' },
      { value: feb2019(16), name: 'fromDate' },
      { value: 4, name: 'nb_days' },
    ],
    constant: false,
  },
  {
    // Guest1 -> Host2
    // lid: 3 (Paris)
    // booked for 4 days: 06/02/2019 to 10/02/2019
    clientIndex: 2,
    name: 'listingBook',
    inputs: [
      { value: 3, name: 'listingId' },
      { value: feb2019(6), name: 'fromDate' },
      { value: 4, name: 'nb_days' },
    ],
    constant: false,
  },
  {
    // Guest2 -> Host2
    // lid: 4 (Beirut)
    // bid: 0
    // booked for 2 days: 12/02/2019 to 14/02/2019
    clientIndex: 3,
    name: 'listingBook',
    inputs: [
      { value: 4, name: 'listingId' },
      { value: feb2019(12), name: 'fromDate' },
      { value: 2, name: 'nb_days' },
    ],
    constant: false,
  },
  // ============================================
  // RATINGS
  // ============================================
  // Cambridge (lid=1) owned by Host1 (clientIndex=0) is rated:
  //    5 stars by Guest1 (bid=0)
  //    2 stars by Guest2 (bid=1)
  // Paris (lid=3) owned by Host2 (clientIndex=0) is rated:
  //    4 stars by Guest1 (bid=0)
  //
  // Host1 rated Guest2 for (bid=1, lid=1)
  //    3 stars
  {
    clientIndex: 2,
    name: 'rate',
    inputs: [
      { value: 1, name: 'lid' },
      { value: 0, name: 'bid' },
      { value: 5, name: 'stars' },
    ],
    constant: false,
  },
  {
    clientIndex: 3,
    name: 'rate',
    inputs: [
      { value: 1, name: 'lid' },
      { value: 1, name: 'bid' },
      { value: 2, name: 'stars' },
    ],
    constant: false,
  },
  {
    clientIndex: 2,
    name: 'rate',
    inputs: [
      { value: 3, name: 'lid' },
      { value: 0, name: 'bid' },
      { value: 4, name: 'stars' },
    ],
    constant: false,
  },
  {
    clientIndex: 0,
    name: 'rate',
    inputs: [
      { value: 1, name: 'lid' },
      { value: 1, name: 'bid' },
      { value: 3, name: 'stars' },
    ],
    constant: false,
  },
]


const DataManager = (database) => {
  const { contractAddress, jsonInterface } = require('./loadAbi')
  // Show web3 where it needs to look for the Ethereum node.
  const abi = jsonInterface.abi
  const web3 = new Web3(new Web3.providers.WebsocketProvider(global.constants.PROVIDER_WS))
  // Load ABI, then contract
  const contract = new web3.eth.Contract(abi, contractAddress)
  const ipfs = ipfsAPI('ipfs.infura.io', '5001', { protocol: 'https' })
  logger.info('IPFS connected')

  // Returns a list of ObjectIds representing the ipfs_images
  // in the database.
  //
  // Loop through all listing's images and upload and add to
  // database all those that aren't already in there
  // Maps all images in listing.images to its ObjectId in the
  // model. If the image is not in the database, it is uploaded
  // to ipfs.infura then added to the model.
  const uploadImgFromFSAndInsertInDB = async (listing) => {
    const images = isSet(listing.images) ? listing.images : []
    return Promise.all(images.map(async (image) => {
      // Upload and insert IPFS Image for all ximages
      // that aren't already in the database
      if (await IPFSImage.countDocuments({ path: image }) === 0) {
        try {
          // Upload image
          const filepath = `${LISTING_IMGS_PATH}/${image}`
          const result = await ipfs.util.addFromFs(filepath, { recursive: true })
          if (result.length === 0) {
            throw new Error('ipfs.util.addFromFs returned zero-length result')
          }
          logger.info(`Added image ${filepath} to IPFS and local database.`)
          // We don't need to insert them anymore
          await database.insertIpfsImage(result[0])
        } catch (err) {
          logger.error(err)
          return Promise.reject()
        }
      }
      return IPFSImage.findOne({ path: image })
    }))
  }

  const metadataMethods = {
    // listing contains the txHash
    createListing: async (listing) => {
      const images = await uploadImgFromFSAndInsertInDB(listing)
      database.insertListing(Object.assign(listing, { images }))
    },
  }

  return {
    addTestDataToChain: async () => {
      logger.silly('addTestDataToChain')
      const accounts = await web3.eth.getAccounts()
      await Promise.all(chainTransactions.map(async (chainTX) => {
        const { name, inputs, clientIndex, metadata } = chainTX
        const inValues = inputs.map(x => x.value)
        const addr = accounts[clientIndex]
        const tx = await contract.methods[name](...inValues).send({ from: addr, gas: 1000000 })
        // e.g meta might be 'listing'
        const meta = Object.assign(isSet(metadata) ? metadata : {}, { txHash: tx.transactionHash })
        const metadataMethod = metadataMethods[name]
        if (isSet(metadataMethod)) {
          await metadataMethod(meta)
        }
      }))
    },
  }
}

module.exports = DataManager
