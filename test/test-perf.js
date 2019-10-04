const truffleAssert = require('truffle-assertions')
const EthBnB_Basic = artifacts.require('EthBnB_Basic')
const EthBnB = artifacts.require('EthBnB')

const {
  feb2019,
  fromFinney,
  createListingDefault,
  bookListingDefault,
  bigNumberToInt,
  BOOKING_CAPACITY,
  DEFAULT_LISTING_PRICE,
  DEFAULT_LISTING_PRICE_WEI,
  COUNTRIES
} = require('./utils')

const getBnB = async (contractName) => {
  if (contractName === 'EthBnB') {
    return await EthBnB.deployed()
  }
  if (contractName === 'EthBnB_Basic') {
    return await EthBnB_Basic.deployed()
  }
  console.log('Invalid ContractName provided')
  return null
}

let used = {} // Store used dates to avoid conflicts

const getGas = res => res.receipt.gasUsed

const getDate = (n) => {
  const RANGE = 1000000
  let r = Math.floor(Math.random() * RANGE)
  while (r in used) {
    r = Math.floor(Math.random() * RANGE)
  }
  const timeMsec = new Date(86400 * 1000 * r).getTime() + 86400 * 1000 * n
  return new Date(timeMsec).getTime() / 1000
}


const runSet = async (bnb, n, lid, a1) => {
  let res
  const bids = []
  const NB_OF_DAYS = 1
  const d1 = { from: a1, value: fromFinney(DEFAULT_LISTING_PRICE * 2 * NB_OF_DAYS) }

  // Book all of them
  for (let i = 0; i < n; i++) {
    res = await bnb.bookListing(lid, getDate(i), NB_OF_DAYS, d1)
    truffleAssert.eventEmitted(res, 'BookingComplete', ev => bids.push(ev.bid))
    console.log(`bookListing-${i}, ${getGas(res)}`)
  }

  // Cancel all of them
  for (let i = 0; i < n; i++) {
    //  Cancel all bookings
    res = await bnb.cancelBooking(lid, bids[i], { from: a1 })
    truffleAssert.eventEmitted(res, 'BookingCancelled')
    console.log(`cancelBooking-${i}, ${getGas(res)}`)
  }
  // Book all of them
  for (let i = 0; i < n; i++) {
    res = await bnb.bookListing(lid, getDate(i), NB_OF_DAYS, d1)
    truffleAssert.eventEmitted(res, 'BookingComplete', ev => bids.push(ev.bid))
    console.log(`bookListing-${i}, ${getGas(res)}`)
  }
}

const testContract = (contractName) => {
  contract(contractName, async (accounts) => {
    it('First test', async () => {
      let res
      let lid
      const bnb = await getBnB(contractName)
      const [a0, a1] = accounts
      used = {} // reset it
      const d = { from: a0, value: fromFinney(DEFAULT_LISTING_PRICE * 10000) }

      res = await bnb.createAccount('Host', { from: a0 })
      res = await bnb.createAccount('Guest', { from: a1 })
      res = await bnb.createListing(COUNTRIES.GB, 'London', DEFAULT_LISTING_PRICE_WEI, d)
      truffleAssert.eventEmitted(res, 'CreateListingEvent', ev => lid = ev.lid)
      console.log(`createListing: ${getGas(res)}`)

      const N = 100
      await runSet(bnb, N, lid,  a1)
    })
  })
}


testContract('EthBnB')
testContract('EthBnB_Basic')
