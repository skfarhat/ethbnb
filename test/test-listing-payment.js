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
} = require('./utils')


const assertExceptionOnAsyncFn = async (fn, msg) => {
  try {
    await fn()
  } catch (err) {
    assert(
        err.toString().search(msg) > -1,
        'Incorrect exception message'
    )
    return
  }
  assert(false, 'Function should have failed with \'' + msg + '\'')
}


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
    const [host, guest] = accounts
    const bnb = await EthBnB.deployed()
    const guestStake = fromFinney(DEFAULT_LISTING_PRICE * 2)
    res = await bnb.createAccount('Host', { from: host })
    res = await bnb.createAccount('Guest', { from: guest })
    const lid = await createListingDefault(bnb, host)

    // Book listing for one day. Should succeed.
    res = await bnb.listingBook(lid, feb2019(20), 1, { from: guest, value: guestStake })

    // Book listing for many days. Should fail, not enough stake.
    try {
      res = await bnb.listingBook(lid, feb2019(20), 5, { from: guest, value: guestStake })
    } catch (err) {
      assert(err.toString().search('Guest must stake twice the price') > -1, 'Unexpected exception message')
      return
    }
    assert(false, 'Exception should have been thrown for Not enough stake')
  })

  it('Booking: excess payment value in listingBook is returned to guest', async () => {
    let res
    const [host, guest] = accounts
    const bnb = await EthBnB.deployed()
    const guestStake = fromFinney(DEFAULT_LISTING_PRICE * 4)
    res = await bnb.createAccount('Host', { from: host })
    res = await bnb.createAccount('Guest', { from: guest })
    const lid = await createListingDefault(bnb, host)
    const guestBalanceBefore = await web3.eth.getBalance(guest)
    res = await bnb.listingBook(lid, feb2019(20), 1, { from: guest, value: guestStake })
    const guestBalanceAfter = await web3.eth.getBalance(guest)
    // Guest's balance should not have decreased x4
    // expect the smart-contract to have refunded excess.
    const guestBalanceDiff = guestBalanceBefore - guestBalanceAfter
    assert(guestBalanceDiff < guestStake, 'Contract should refund excess stake provided in listingBook')
  })

  it('Fulfill: bookingFulfilled fails when host tries', async () => {
    const [host, guest] = accounts
    const bnb = await EthBnB.deployed()
    res = await bnb.createAccount('Host', { from: host })
    res = await bnb.createAccount('Guest', { from: guest })
    const lid = await createListingDefault(bnb, host)
    const bid = await bookListingDefault(bnb, guest, lid, feb2019(20), 3)

    await assertExceptionOnAsyncFn(
      async () => await bnb.bookingFulfilled(lid, bid, { from: host }),
      'Only guest can call bookingFulfilled'
    )
  })

  it('Fulfill: bookingFulfilled succeeds when guest tries', async () => {
    const [host, guest] = accounts
    const bnb = await EthBnB.deployed()
    res = await bnb.createAccount('Host', { from: host })
    res = await bnb.createAccount('Guest', { from: guest })
    const lid = await createListingDefault(bnb, host)
    const bid = await bookListingDefault(bnb, guest, lid, feb2019(20), 3)
    async () => await bnb.bookingFulfilled(lid, bid, { from: guest })
  })

  it('Fulfill: bookingFulfilled can only be called after the booking end date', async () => {
    const [host, guest] = accounts
    const futureDate = new Date('3119-02-11').getTime() / 1000
    const bnb = await EthBnB.deployed()
    res = await bnb.createAccount('Host', { from: host })
    res = await bnb.createAccount('Guest', { from: guest })
    const lid = await createListingDefault(bnb, host)
    const bid = await bookListingDefault(bnb, guest, lid, futureDate, 3)
    await assertExceptionOnAsyncFn(
      async () => await bnb.bookingFulfilled(lid, bid, { from: guest }),
      'Cannot fullfill booking before end date'
    )
  })

  it('Fulfill: Releases funds after guest confirms', async () => {

    const getListingBalance = async (lid, host) => {
      const res = await bnb.getListingAll(lid, { from: host })
      const { balance: balance } = res
      return balance
    }

    const [host, guest] = accounts
    const bnb = await EthBnB.deployed()
    res = await bnb.createAccount('Host', { from: host })
    res = await bnb.createAccount('Guest', { from: guest })

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

    // BEFORE: Snapshot guest and host balances
    const guestBalanceBefore = await web3.eth.getBalance(guest)
    const hostBalanceBefore = await web3.eth.getBalance(host)
    const contractBalanceBefore = await web3.eth.getBalance(bnb.address)
    const listingBalanceBefore = await getListingBalance(lid, host)

    // Guest fulfills
    res = await bnb.bookingFulfilled(lid, bid, { from: guest })

    // AFTER: Calculate balance differentials
    const contractBalanceDiff = (await web3.eth.getBalance(bnb.address)) - contractBalanceBefore
    const guestBalanceDiff = (await web3.eth.getBalance(guest)) - guestBalanceBefore
    const hostBalanceDiff = (await web3.eth.getBalance(host)) - hostBalanceBefore
    const listingBalanceDiff = (await getListingBalance(lid, host)) - listingBalanceBefore

    // IMPROV: At the moment we only check that guest and host balances have increased
    //         but not by how much. It's slightly tedious to calculate exact amounts
    //         because their balances will have decreased by the gas cost of the transactions.
    //
    // Balance updates:
    //  - the contract's balance should have decreased by 2 x amount
    //  - guest's balance should increase by amount relative to before fulfilment (approx)
    //  - host's balances should increase by amount relative to before fulfilment (approx)
    //  - listing's balance should increase by 2 x amount
    assert(contractBalanceDiff == (-2) * priceWei, 'Contract\'s balance should decrease')
    assert(guestBalanceDiff > priceWei / 2, 'Guest\'s balance should increase')
    assert(hostBalanceDiff > priceWei / 2, 'Host\'s balance should increase')
    assert(listingBalanceDiff == 2 * priceWei, 'Listing\s balance should increase by twice amount')
  })

})
