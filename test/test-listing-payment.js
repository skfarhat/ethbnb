const web3 = require('web3')
const truffleAssert = require('truffle-assertions')

const EthBnB = artifacts.require('EthBnB')
const COUNTRIES = {
  GB: 226, US: 227,
}

/**
 * Formats the provided day-date string to the format accepted by listing book
 * @param  {string} dateStr day-date string of the form '2019-02-13'
 * @return {int}    date formatted such that bookListing() likes it
 */
const formatDate = (dateStr) => new Date(dateStr).getTime() / 1000
const fromFinney = price => web3.utils.toWei(`${price}`, 'finney')

contract('EthBnB', async (accounts) => {
  it('Owner must stake at least 2 x price', async () => {
    const bnb = await EthBnB.deployed()
    const [host] = accounts
    const priceFinney = 800
    const priceWei = fromFinney(priceFinney)
    const stakeWei = priceWei
    await bnb.createAccount('Host', { from: host })
    try {
      // we create a listing and stake the same price
      await bnb.createListing(COUNTRIES.GB, 'London', priceWei, { from: host, value: stakeWei })
      assert(false, 'Should have thrown an exception')
    } catch (e) {
      // Pass
    }
  })

  it('Owner must stake at least 2 x price and it has to be a multiple of price', async () => {
    const bnb = await EthBnB.deployed()
    const [host] = accounts
    const priceFinney = 800
    const stakeFinney = 900
    const priceWei = fromFinney(priceFinney)
    const stakeWei = fromFinney(stakeFinney)
    assert(!Number.isInteger(priceFinney / stakeFinney)) // let's make sure it's not an integer
    await bnb.createAccount('Host', { from: host })
    try {
      await bnb.createListing(COUNTRIES.GB, 'London', priceWei, { from: host, value: stakeWei })
      assert(false, 'Should have thrown an exception')
    } catch (e) {
      // Pass
    }
  })

  it('listingCreate works when the host provides an acceptable stake (n x price)', async () => {
    const bnb = await EthBnB.deployed()
    const [host] = accounts
    const priceFinney = 800
    const priceWei = fromFinney(priceFinney) // the acutal house price in wei
    const stakeWei1 = fromFinney(priceFinney * 2) // value staked by the host
    const stakeWei2 = fromFinney(priceFinney * 3) // value staked by the host
    await bnb.createAccount('Host', { from: host })
    try {
      await bnb.createListing(COUNTRIES.GB, 'London', priceWei, { from: host, value: stakeWei1 })
      await bnb.createListing(COUNTRIES.GB, 'Paris', priceWei, { from: host, value: stakeWei2 })
    } catch (e) {
      assert(false)
    }
  })

  it('Neither host nor guest can rate before booking end', async () => {
    let lid
    let res
    const bnb = await EthBnB.deployed()
    const [host, guest] = accounts
    const priceFinney = 800
    const priceWei = fromFinney(priceFinney)
    const stakeWei = fromFinney(priceFinney * 3)
    const guestStakeWei = fromFinney(priceFinney * 2)
    // We create accounts and a listing providing a valid stake (x3)
    await bnb.createAccount('Host', { from: host })
    await bnb.createAccount('Guest', { from: guest })
    res = await bnb.createListing(COUNTRIES.GB, 'London', priceWei, { from: host, value: stakeWei })
    truffleAssert.eventEmitted(res, 'CreateListingEvent', ev => lid = ev.lid)
    // Guest books the listing and provides appropriate payment
    res = await bnb.listingBook(lid, formatDate('2019-02-02'), 3, { from: guest, value: guestStakeWei })
    truffleAssert.eventEmitted(res, 'BookingComplete', ev => bid = ev.bid)

    // Host rates the guest
    try {
      res = await bnb.rate(lid1, bid1, 1, { from: accounts[1] })
      assert(false, 'Rating should fail because the booking has not elapsed')
    } catch(err) {
      // Pass
    }
  })

  it('Bookings fail when the stake value has run out', async () => {
    // Third booking should fail because stake run out
    let lid
    let res
    const bnb = await EthBnB.deployed()
    const [host, guest1, guest2, guest3] = accounts
    const priceFinney = 800
    const priceWei = fromFinney(priceFinney)
    const hostStakeWei = fromFinney(priceFinney * 3)
    const guestStake = fromFinney(priceFinney * 2)
    await bnb.createAccount('Host', { from: host })
    await bnb.createAccount('Guest1', { from: guest1 })
    await bnb.createAccount('Guest1', { from: guest2 })
    res = await bnb.createListing(COUNTRIES.GB, 'London', priceWei, { from: host, value: hostStakeWei })
    truffleAssert.eventEmitted(res, 'CreateListingEvent', ev => lid = ev.lid)
    res = await bnb.listingBook(lid, formatDate('2019-02-02'), 1, { from: guest1, value: guestStake })
    truffleAssert.eventEmitted(res, 'BookingComplete', ev => bid = ev.bid)
    res = await bnb.listingBook(lid, formatDate('2019-04-02'), 1, { from: guest2, value: guestStake })
    truffleAssert.eventEmitted(res, 'BookingComplete', ev => bid = ev.bid)
    try {
      await bnb.listingBook(lid, formatDate('2019-06-02'), 1, { from: guest3, value: guestStake })
      assert(false, 'Third booking should fail')
    } catch(err) {
      // Pass
    }
  })

  // TODO: how do we test that it only succeeds after the given day has passed?
  // can we mock the system date somehow?

  it('Listing can be closed and stake is returned to host', async () => {
    assert(false, 'Not implemented')
  })
})
