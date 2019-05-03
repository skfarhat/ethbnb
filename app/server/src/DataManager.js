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
const { contractAddress, jsonInterface } = require('./loadAbi')

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


// Show web3 where it needs to look for the Ethereum node.
const abi = jsonInterface.abi
const web3 = new Web3(new Web3.providers.WebsocketProvider(global.constants.PROVIDER_WS))
// Load ABI, then contract
const contract = new web3.eth.Contract(abi, contractAddress)

const listingMetadata = {
  1: {
    title: '53 Devonshire-on-Rails',
    description: 'Welcome to the super awesome Devonshire place.',
    images: ['1.jpg'],
  },
  2: {
    title: 'Lovely house at Croissy-Sur-Seine',
    description: `Ouvry Manor - big place - jakuzzi - sauna - lovely spaceous garden - big DIY garage - 4 bedrooms
    and BABY-FOOT`,
    images: ['2.jpeg'],
  },
  3: {
    title: 'London Victorian House',
    description: `Good sized, basic double room in a 3 bed Shared flat situated in the heart of Holborn,
    East Central London. The flat comprises of a fitted kitchen and a shared bathroom.`,
    images: ['3.jpg'],
  },
  4: {
    title: 'Beirut Central',
    description: 'Lovely house',
  },
  5: {
    title: 'Sidon Castle',
    description: 'Lovely Saida residence next to Ain-el-Helwe. Stay next door to the lovely Im Wassim.',
  },
}
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
  },
  {
    // owner: Host1
    // lid: 3
    clientIndex: 2,
    name: 'createListing',
    inputs: [
      { value: '75'/* FR */, name: 'country' },
      { value: 'Paris', name: 'location' },
      { value: '2000', name: 'price' },
    ],
    constant: false,
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
      { value: feb2019(10), name: 'from_date' },
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
      { value: feb2019(16), name: 'from_date' },
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
      { value: feb2019(16), name: 'from_date' },
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
      { value: feb2019(6), name: 'from_date' },
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
      { value: feb2019(12), name: 'from_date' },
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
  // Paris (lid=2) owned by Host1 (clientIndex=0) is rated:
  //    4 stars by Guest1 (bid=0)
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
]

const DataManager = {

  addTestDataToChain: async () => {
    logger.silly('addTestDataToChain')
    const accounts = await web3.eth.getAccounts()
    // All functions in testData are expected to be non-constant:
    // we send a transaction to execute each.
    await Promise.all(chainTransactions.map((chainTX) => {
      const { name, inputs, clientIndex } = chainTX
      const inValues = inputs.map(x => x.value)
      const addr = accounts[clientIndex]
      return contract.methods[name](...inValues).send({ from: addr, gas: 1000000 })
    }))
  },

  addListingMetadata: async () => {
    logger.silly('addListingMetadata')
    await Promise.all(Object.keys(listingMetadata).map(async (lid) => {
      // Wait for the listing to be inserted
      while (!await Listings.findOne({ lid })) {
        sleep(500)
      }
      const meta = listingMetadata[lid]
      if (Array.isArray(meta.images)) {
        // Replace each image file path in the model
        // with the ObjectId referencing the actual document.
        meta.images = await Promise.all(
          meta.images.map(async imgName => IPFSImage.findOne({ path: imgName })),
        )
      }
      await Listings.findOneAndUpdate({ lid }, meta)
    }))
  },

  // Return an array of IPFS details of the images added
  // to IPFS.
  imagesAddToIPFSAndDB: async () => {
    logger.silly('images_add_to_ipfs')
    const ipfs = ipfsAPI('ipfs.infura.io', '5001', { protocol: 'https' })
    logger.info('IPFS connected')

    // Filter files and keep only image related ones
    const images = fs.readdirSync(LISTING_IMGS_PATH).filter(filename => ['.png', '.jpg', '.jpeg'].findIndex(x => x === path.extname(filename)) > -1)

    // For each image file:
    //    - Add it to IPFS
    //    - Add it to local database
    for (const img of images) {
      // If image already exists in database, continue without
      if (await IPFSImage.count({ path: img }) === 0) {
        try {
          const filepath = `${LISTING_IMGS_PATH}/${img}`
          // Add image to ipfs
          const result = await ipfs.util.addFromFs(filepath, { recursive: true })
          if (result.length === 0) {
            throw new Error('ipfs.util.addFromFs returned zero-length result')
          }
          // Add ipfs image to database
          await (new IPFSImage(result[0])).save() // get the first item from the array
          logger.info(`Added image ${filepath} to IPFS and local database.`)
        } catch (err) {
          console.log(err)
          return null
        }
      }
    }
  },
}

module.exports = DataManager
