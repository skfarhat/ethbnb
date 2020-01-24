const truffleAssert = require('truffle-assertions')
const EthBnB1 = artifacts.require('EthBnB1')
const EthBnB = artifacts.require('EthBnB')

const {
  fromFinney,
  COUNTRIES,
  DEFAULT_LISTING_PRICE,
  DEFAULT_LISTING_PRICE_WEI,
} = require('../utils')

const getBnB = async (contractName) => {
  if (contractName === 'EthBnB') {
    return await EthBnB.deployed()
  }
  if (contractName === 'EthBnB1') {
    return await EthBnB1.deployed()
  }
  console.log('Invalid ContractName provided')
  return null
}

let used = {} // Store used dates to avoid conflicts

const getGas = res => res.receipt.gasUsed

const getDateShifting = (i, N) => {
  const DAY_MSEC = 86400 * 1000
  const RANGE_DAYS = 1000000 // range of days from which we pick from
  const rnd = Math.random()
  let r = Math.floor((rnd + i / N) * RANGE_DAYS) * DAY_MSEC
  while (r in used) {
    r = Math.floor((r + i / N) * RANGE_DAYS) * DAY_MSEC
  }
  return Math.floor(new Date(Date.now() + r).getTime() / 1000)
}
/**
 *
 * @param bnb           EthBnB reference
 * @param bnb1          EthBnB using ascending-order sorted linked list
 * @param lid           listing identifier
 * @param a1            address of account
 * @param opts          {
 *                        n = iterations,
 *                        batchCount = items per batch,
 *                        showCancelResults = show gas costs for cancel operations
 *                      }
 */
const runTest = async (bnb, bnb1, lid, a1, opts) => {
  const { n, batchCount, showCancelResults } = opts
  let res
  const NB_OF_DAYS = 1
  const d1 = { from: a1, value: fromFinney(DEFAULT_LISTING_PRICE * 2 * NB_OF_DAYS) }
  console.log(`iterations=${n}, batchCount=${batchCount}`)
  console.log('Name, Optim, Optim1, Day')

  const total = n * batchCount
  const index = (i, b) => i * batchCount + b
  for (let i = 0; i < n; i++) {
    const bids = []
    const bids2 = []
    // Book listing in batches
    for (let b = 0; b < batchCount; b++) {
      const idx = index(i, b)
      const date = getDateShifting(idx, total)
      const day = Math.floor(date / (86400))
      // const date2 = new Date(date * 1000)
      // console.log(`${date}, ${date2}`)
      res = await bnb.bookListing(lid, date, NB_OF_DAYS, d1)
      truffleAssert.eventEmitted(res, 'BookingComplete', ev => bids.push(ev.bid))
      const gas1 = getGas(res)

      res = await bnb1.bookListing(lid, date, NB_OF_DAYS, d1)
      truffleAssert.eventEmitted(res, 'BookingComplete', ev => bids2.push(ev.bid))
      const gas2 = getGas(res)

      console.log(`bookListing-${idx}, ${gas1}, ${gas2}, ${day}`)
    }
    // Cancel previous batches
    for (let b = 0; b < batchCount; b++) {
      res = await bnb.cancelBooking(bids[b], { from: a1 })
      truffleAssert.eventEmitted(res, 'BookingCancelled')
      const gas1 = getGas(res)
      res = await bnb1.cancelBooking(bids2[b], { from: a1 }) // EthBnB_Basic requires the lid be provided unlike EthBnB
      truffleAssert.eventEmitted(res, 'BookingCancelled')
      const gas2 = getGas(res)
      if (showCancelResults) {
        console.log(`cancelBooking-${i}, ${gas1}, ${gas2}, `)
      }
    }
  }
}

const runSetBoth = async (bnb, bnb_basic, n, lid, a1) => {
  let res
  const bids = []
  const bids2 = []
  const NB_OF_DAYS = 1
  const d1 = { from: a1, value: fromFinney(DEFAULT_LISTING_PRICE * 2 * NB_OF_DAYS) }

  console.log('Name, Optim, Basic, Day')
  // Book all of them
  for (let i = 0; i < n; i++) {
    const date = getDateShifting(i, n)
    const day = Math.floor(date / (86400))
    // const date2 = new Date(date * 1000)
    // console.log(`${date}, ${date2}`)
    res = await bnb.bookListing(lid, date, NB_OF_DAYS, d1)
    truffleAssert.eventEmitted(res, 'BookingComplete', ev => bids.push(ev.bid))
    const gas1 = getGas(res)

    res = await bnb_basic.bookListing(lid, date, NB_OF_DAYS, d1)
    truffleAssert.eventEmitted(res, 'BookingComplete', ev => bids2.push(ev.bid))
    const gas2 = getGas(res)

    console.log(`bookListing-${i}, ${gas1}, ${gas2}, ${day}`)
  }

  // Cancel all of them
  for (let i = 0; i < n; i++) {
    res = await bnb.cancelBooking(bids[i], { from: a1 })
    truffleAssert.eventEmitted(res, 'BookingCancelled')
    const gas1 = getGas(res)
    res = await bnb_basic.cancelBooking(bids2[i], { from: a1 }) // EthBnB_Basic requires the lid be provided unlike EthBnB
    truffleAssert.eventEmitted(res, 'BookingCancelled')
    const gas2 = getGas(res)

    console.log(`cancelBooking-${i}, ${gas1}, ${gas2}, `)
  }

  // Book all of them
  for (let i = 0; i < n; i++) {
    const date = getDateShifting(i, n)
    const day = date / (86400)
    res = await bnb.bookListing(lid, date, NB_OF_DAYS, d1)
    truffleAssert.eventEmitted(res, 'BookingComplete', ev => bids.push(ev.bid))
    const gas1 = getGas(res)

    res = await bnb_basic.bookListing(lid, date, NB_OF_DAYS, d1)
    truffleAssert.eventEmitted(res, 'BookingComplete', ev => bids2.push(ev.bid))
    const gas2 = getGas(res)

    console.log(`bookListing-${i}, ${gas1}, ${gas2}, ${day}`)
  }
}

// for(var i = 0; i < 1000; i++) {
//   const d = getDateShifting(i, 1000)
//   const date = new Date(d * 1000)
//   console.log(`${d}, ${date}`)
// }

contract('EthBnB', async (accounts) => {
  contract('EthBnB1', async (accounts2) => {
    it('First test', async () => {

      // const testParams = [[100, 1], [20, 5], [10, 10], [5, 20], [1, 100]]
      const testParams = [[1, 250]]

      for (let i in testParams) {
        let res
        let lid
        const bnb = await getBnB('EthBnB')
        const bnb1 = await getBnB('EthBnB1')
        const [a0, a1] = accounts
        used = {} // reset it
        const d = { from: a0, value: fromFinney(DEFAULT_LISTING_PRICE * 100000) }

        res = await bnb.createAccount('Host', { from: a0 })
        res = await bnb.createAccount('Guest', { from: a1 })

        res = await bnb1.createAccount('Host', { from: a0 })
        res = await bnb1.createAccount('Guest', { from: a1 })

        res = await bnb.createListing(COUNTRIES.GB, 'London', DEFAULT_LISTING_PRICE_WEI, d)
        truffleAssert.eventEmitted(res, 'CreateListingEvent', ev => lid = ev.lid)

        res = await bnb1.createListing(COUNTRIES.GB, 'London', DEFAULT_LISTING_PRICE_WEI, d)
        truffleAssert.eventEmitted(res, 'CreateListingEvent', ev => lid = ev.lid)

        const opts = {
          n: testParams[i][0],
          batchCount: testParams[i][1],
          showCancelResults: false
        }
        await runTest(bnb, bnb1, lid, a1, opts)
      }
    })
  })
})
