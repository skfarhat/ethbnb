const truffleAssert = require('truffle-assertions')
const EthBnB = artifacts.require('EthBnB')

const {
  feb2019,
  fromFinney,
  createListingDefault,
  bookListingDefault,
  BOOKING_CAPACITY,
  DEFAULT_LISTING_PRICE,
  DEFAULT_LISTING_PRICE_WEI,
  COUNTRIES
} = require('./test-utils')

contract('EthBnB', async (accounts) => {

  /**
   * Convenience function
   *
   * @param  {int} dayNb in range [1..28]
   * @return {int}       seconds timestamp of date in Feb 2019
   *                     e.g. feb2019(10) returns the timestamp of 10/02/2019
   *                          which is 1549756800
   */
  const feb2019 = dayNb => new Date(`2019-02-${dayNb}`).getTime() / 1000

  /**
   * Create a default listing and return its id
   * function will assert if no CreateListingEvent is fired
   *
   * @bnb           the deployed contract
   * @account       the account that should create the listing
   */
  const createListingDefault = async (bnb, account) => {
    let lid
    // We will send 20 times the price amount, to ensure many bookings can be achieved using the default-created listing
    const d = { from: account, value: fromFinney(DEFAULT_LISTING_PRICE * 20) }
    const res = await bnb.createListing(COUNTRIES.GB, 'London', DEFAULT_LISTING_PRICE_WEI, d)
    truffleAssert.eventEmitted(res, 'CreateListingEvent', ev => lid = ev.lid)
    return lid
  }

  const fromFinney = price => web3.utils.toWei(`${price}`, 'finney')

  it('Bookings fail when the stake value has run out', async () => {
    // Third booking should fail because stake run out
    let lid
    let res
    let bid
    const bnb = await EthBnB.deployed()
    const [host, guest1, guest2, guest3] = accounts
    const priceFinney = 8
    const priceWei = fromFinney(priceFinney)
    const hostStakeWei = fromFinney(priceFinney * 4)
    const guestStake = fromFinney(priceFinney * 2)
    await bnb.createAccount('Host', { from: host })
    await bnb.createAccount('Guest1', { from: guest1 })
    await bnb.createAccount('Guest2', { from: guest2 })
    res = await bnb.createListing(COUNTRIES.GB, 'London', priceWei, { from: host, value: hostStakeWei })
    truffleAssert.eventEmitted(res, 'CreateListingEvent', ev => lid = ev.lid)
    res = await bnb.listingBook(lid, feb2019(20), 1, { from: guest1, value: guestStake })
    truffleAssert.eventEmitted(res, 'BookingComplete', ev => bid = ev.bid)
    res = await bnb.listingBook(lid, feb2019(23), 1, { from: guest2, value: guestStake })
    truffleAssert.eventEmitted(res, 'BookingComplete', ev => bid = ev.bid)
    try {
      await bnb.listingBook(lid, feb2019(6), 1, { from: guest3, value: guestStake })
    } catch(err) {
      // console.log('the exception thrown is', err)
      return
    }
    assert(false, 'Third booking should fail')
  })

  it('Balances are correct after listing creation', async() => {
    const bnb = await EthBnB.deployed()
    let lid
    let res
    let bid
    const [host] = accounts
    const priceFinney = 8
    const priceWei = fromFinney(priceFinney)
    const hostStakeWei = fromFinney(priceFinney * 3)
    await bnb.createAccount('Host', { from: host })

    // Snapshot balances before and after listing creation
    const hostBalanceBefore = await web3.eth.getBalance(host)
    const contractBalanceBefore = await web3.eth.getBalance(bnb.address)
    res = await bnb.createListing(COUNTRIES.GB, 'London', priceWei, { from: host, value: hostStakeWei })
    const hostBalanceAfter = await web3.eth.getBalance(host)
    const contractBalanceAfter = await web3.eth.getBalance(bnb.address)

    const contractBalanceDiff = contractBalanceAfter - contractBalanceBefore
    const hostBalanceDiff = hostBalanceBefore - hostBalanceAfter

    assert(contractBalanceDiff == hostStakeWei, 'Contract balance must have incremented by stake amount')
    // Host balance will likely decrement by more, since they pay for the processing of the application
    assert(hostBalanceDiff >= hostStakeWei, 'Host balance must have decremented by at least stake amount')
    truffleAssert.eventEmitted(res, 'CreateListingEvent', ev => lid = ev.lid)
  })

  it('Balances are correct after listing booking', async() => {
    const bnb = await EthBnB.deployed()
    let lid
    let res
    let bid
    const [host, guest] = accounts
    const priceFinney = 8
    const priceWei = fromFinney(priceFinney)
    const hostStakeWei = fromFinney(priceFinney * 2)
    const guestStakeWei = fromFinney(priceFinney * 2)
    await bnb.createAccount('Host', { from: host })
    await bnb.createAccount('Guest', { from: guest })

    res = await bnb.createListing(COUNTRIES.GB, 'London', priceWei, { from: host, value: hostStakeWei })
    truffleAssert.eventEmitted(res, 'CreateListingEvent', ev => lid = ev.lid)

    // Snapshot balances before and after listing booking
    const guestBalanceBefore = await web3.eth.getBalance(guest)
    const contractBalanceBefore = await web3.eth.getBalance(bnb.address)
    res = await bnb.listingBook(lid, feb2019(10), 1, { from: guest, value: guestStakeWei })
    truffleAssert.eventEmitted(res, 'BookingComplete', ev => bid = ev.bid)
    const guestBalanceAfter = await web3.eth.getBalance(guest)
    const contractBalanceAfter = await web3.eth.getBalance(bnb.address)

    const contractBalanceDiff = contractBalanceAfter - contractBalanceBefore
    const guestBalanceDiff = guestBalanceBefore - guestBalanceAfter

    assert(contractBalanceDiff == guestStakeWei, 'Contract balance must have incremented by stake amount')
    // Guest balance will likely decrement by more, since they pay for the processing of the application
    assert(guestBalanceDiff >= guestStakeWei, 'Host balance must have decremented by at least stake amount')
  })


  it('Balances are correct after booking is rated by both', async() => {
    const bnb = await EthBnB.deployed()
    let lid
    let res
    let bid
    const [host, guest] = accounts
    const priceFinney = 8
    const priceWei = fromFinney(priceFinney)
    const hostStakeWei = fromFinney(priceFinney * 2)
    const guestStakeWei = fromFinney(priceFinney * 2)
    await bnb.createAccount('Host', { from: host })
    await bnb.createAccount('Guest', { from: guest })

    res = await bnb.createListing(COUNTRIES.GB, 'London', priceWei, { from: host, value: hostStakeWei })
    truffleAssert.eventEmitted(res, 'CreateListingEvent', ev => lid = ev.lid)
    res = await bnb.listingBook(lid, feb2019(10), 1, { from: guest, value: guestStakeWei })
    truffleAssert.eventEmitted(res, 'BookingComplete', ev => bid = ev.bid)

    // Snapshot guest and host balances
    let guestBalanceBefore = await web3.eth.getBalance(guest)
    let hostBalanceBefore = await web3.eth.getBalance(host)
    let contractBalanceBefore = await web3.eth.getBalance(bnb.address)

    // Host rates
    res = await bnb.rate(lid, bid, 3, { from: host })
    const gasUsed = res.receipt.gasUsed
    // Ensure contract's balance doesn't change following only one rate
    assert(contractBalanceBefore == (await web3.eth.getBalance(bnb.address)), 'Contract\'s balance should not change following the first rate')

    const gasPrice = await web3.eth.getGasPrice()
    // Guest rates
    res = await bnb.rate(lid, bid, 5, { from: guest })

    const contractBalanceDiff = (await web3.eth.getBalance(bnb.address)) - contractBalanceBefore
    const guestBalanceDiff = (await web3.eth.getBalance(guest)) - guestBalanceBefore
    const hostBalanceDiff = (await web3.eth.getBalance(host)) - hostBalanceBefore

    // IMPROV: At the moment we only check that guest and host balances have increased
    //         but not by how much. It's slightly tedious to calculate exact amounts because
    //         their balances will have increased as a result of issuing the transactions and getting
    //         mined.
    //
    // Balance updates:
    //  - the contract's balance should have decreased by 2 x stake
    //  - guest's balance should increase by stake relative to the time before they rated
    //  - host's balances should increase by stake relative to the time before they rated
    assert(contractBalanceDiff == (-2) * priceWei, 'Contract\'s balance should decrease after both have rated')
    assert(guestBalanceDiff > priceWei / 2, 'Guest\'s balance should increase after both have rated')
    assert(hostBalanceDiff > priceWei / 2, 'Host\'s balance should increase after both have rated')
  })

  // TODO: how do we test that it only succeeds after the given day has passed?
  // can we mock the system date somehow?

  it('Listing can be deleted and stake is returned to host', async () => {
    let res
    const [host] = accounts
    const bnb = await EthBnB.deployed()
    res = await bnb.createAccount('Alex', { from: host })
    const balance1 = await web3.eth.getBalance(host)
    let lid = await createListingDefault(bnb, host)
    const balance2 = await web3.eth.getBalance(host)
    res = await bnb.listingDelete(lid)
    const balance3 = await web3.eth.getBalance(host)

    truffleAssert.eventEmitted(res, 'DeleteListingEvent', ev => lid = ev.lid)
    const balanceDiff1 = balance2 - balance1
    const balanceDiff2 =  balance3 - balance2
    assert(balanceDiff2 > 0, 'Account\'s balance should have increased after listing deletion')
    // Since we can't calculate account balances with accuracy (because issuing transaction)
    // costs gas, we will take it as correct if balanceDiff2 is at least half the absolute value
    // of balanceDiff1
    assert(balanceDiff2 > (-0.5) * balanceDiff1, 'Account\'s balance should have increased after listing deletion')
  })

  it('Contract refunds the guest if the booking fails', async () => {
    let res
    const [host, guest1, guest2] = accounts
    const bnb = await EthBnB.deployed()
    const guest2Stake = fromFinney(DEFAULT_LISTING_PRICE * 2)
    res = await bnb.createAccount('Host', { from: host })
    res = await bnb.createAccount('Guest1', { from: guest1 })
    res = await bnb.createAccount('Guest2', { from: guest2 })
    const lid = await createListingDefault(bnb, host)

    // Guest1 books the listing
    res = await bnb.listingBook(lid, feb2019(20), 1, { from: guest2, value: guest2Stake })

    // Guest2 tries to book it and fails
    const balance3 = await web3.eth.getBalance(bnb.address)
    res = await bnb.listingBook(lid, feb2019(20), 1, { from: guest2, value: guest2Stake })
    const balance4 = await web3.eth.getBalance(bnb.address)
    truffleAssert.eventEmitted(res, 'BookingConflict')

    // Ensure the contract balance does not increase following the failed booking
    assert(balance3 == balance4, 'Contract balance should not increase when a failed booking occurs')
  })

  it('Booking price scales with number of days', async () => {
    let res
    const [host, guest1] = accounts
    const bnb = await EthBnB.deployed()
    const guestStake = fromFinney(DEFAULT_LISTING_PRICE * 2)
    res = await bnb.createAccount('Host', { from: host })
    res = await bnb.createAccount('Guest1', { from: guest1 })
    const lid = await createListingDefault(bnb, host)

    // Book listing for one day. Should succeed.
    res = await bnb.listingBook(lid, feb2019(20), 1, { from: guest1, value: guestStake })

    // Book listing for many days. Should fail, not enough stake.
    try {
      res = await bnb.listingBook(lid, feb2019(20), 5, { from: guest1, value: guestStake })
    } catch (err) {
      assert(err.toString().search('Guest must stake twice the price') > -1, 'Unexpected exception message')
      return
    }
    assert(false, 'Exception should have been thrown for Not enough stake')
  })

  it('Listing: setting a listing price fails when there is not enough staked ', async () => {
    assert(false, 'Not implemented')
  })

  it('User must increase stake in order to set the price', async() => {
    assert(false, 'Not implemented')
  })

})
