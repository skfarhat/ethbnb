const truffleAssert = require('truffle-assertions')
const EthBnB_Basic = artifacts.require('EthBnB_Basic')
const EthBnB = artifacts.require('EthBnB')

const {
  fromFinney,
  DEFAULT_LISTING_PRICE,
  DEFAULT_LISTING_PRICE_WEI,
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

const getDateShifting = (i, N) => {
  const DAY_MSEC = 86400 * 1000
  const RANGE_DAYS = 1000000 // range of days from which we pick from
  const rnd = Math.random()
  let r = Math.floor((rnd + i / N) * RANGE_DAYS) * DAY_MSEC
  while (r in used) {
    r = Math.floor((r + i / N) * RANGE_DAYS) * DAY_MSEC
  }
  // console.log(`${i}-${r}`)
  return new Date(r).getTime() / 1000
}

const runSetBoth = async (bnb, bnb2, n, lid, a1) => {
  let res
  const bids = []
  const bids2 = []
  const NB_OF_DAYS = 1
  const d1 = { from: a1, value: fromFinney(DEFAULT_LISTING_PRICE * 2 * NB_OF_DAYS) }

  console.log('Name, Optim, Basic, Day')
  // Book all of them
  for (let i = 0; i < n; i++) {
    const date = getDateShifting(i, n)
    const day = date / (86400)
    // const date2 = new Date(day * 1000)
    // console.log(`${date}, ${date2}`)
    res = await bnb.bookListing(lid, date, NB_OF_DAYS, d1)
    truffleAssert.eventEmitted(res, 'BookingComplete', ev => bids.push(ev.bid))
    const gas1 = getGas(res)

    res = await bnb2.bookListing(lid, date, NB_OF_DAYS, d1)
    truffleAssert.eventEmitted(res, 'BookingComplete', ev => bids2.push(ev.bid))
    const gas2 = getGas(res)

    console.log(`bookListing-${i}, ${gas1}, ${gas2}, ${day}`)
  }

  // Cancel all of them
  for (let i = 0; i < n; i++) {
    res = await bnb.cancelBooking(lid, bids[i], { from: a1 })
    truffleAssert.eventEmitted(res, 'BookingCancelled')
    const gas1 = getGas(res)
    res = await bnb2.cancelBooking(lid, bids2[i], { from: a1 })
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

    res = await bnb2.bookListing(lid, date, NB_OF_DAYS, d1)
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
  contract('EthBnB_Basic', async (accounts2) => {
    it('First test', async () => {
      let res
      let lid
      const bnb = await getBnB('EthBnB')
      const bnb_basic = await getBnB('EthBnB_Basic')
      const [a0, a1] = accounts
      used = {} // reset it
      const d = { from: a0, value: fromFinney(DEFAULT_LISTING_PRICE * 100000) }

      res = await bnb.createAccount('Host', { from: a0 })
      res = await bnb.createAccount('Guest', { from: a1 })

      res = await bnb_basic.createAccount('Host', { from: a0 })
      res = await bnb_basic.createAccount('Guest', { from: a1 })

      res = await bnb.createListing(COUNTRIES.GB, 'London', DEFAULT_LISTING_PRICE_WEI, d)
      truffleAssert.eventEmitted(res, 'CreateListingEvent', ev => lid = ev.lid)

      res = await bnb_basic.createListing(COUNTRIES.GB, 'London', DEFAULT_LISTING_PRICE_WEI, d)
      truffleAssert.eventEmitted(res, 'CreateListingEvent', ev => lid = ev.lid)

      const N = 100
      await runSetBoth(bnb, bnb_basic, N, lid, a1)
    })
  })
})
