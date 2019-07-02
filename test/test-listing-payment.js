// const web3 = require('web3')
const truffleAssert = require('truffle-assertions')

const EthBnB = artifacts.require('EthBnB')
const COUNTRIES = {
  GB: 226, US: 227,
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

  const fromFinney = price => web3.utils.toWei(`${price}`, 'finney')

  it('Owner must stake at least 2 x price', async () => {
    const bnb = await EthBnB.deployed()
    const [host] = accounts
    const priceFinney = 8
    const priceWei = fromFinney(priceFinney)
    const stakeWei = priceWei
    await bnb.createAccount('Host', { from: host })
    try {
      // we create a listing and stake the same price
      await bnb.createListing(COUNTRIES.GB, 'London', priceWei, { from: host, value: stakeWei })
    } catch (e) {
      assert(e.toString().search('Must stake at least') > -1, 'The revert message does not match expectation')
      return
    }
    assert(false, 'Should have thrown an exception')
  })

  // it('Owner must stake at least 2 x price and it has to be a multiple of price', async () => {
  //   const bnb = await EthBnB.deployed()
  //   const [host] = accounts
  //   const priceFinney = 800
  //   const stakeFinney = 900
  //   const priceWei = fromFinney(priceFinney)
  //   const stakeWei = fromFinney(stakeFinney)
  //   assert(!Number.isInteger(stakeFinney / priceFinney)) // let's make sure it's not an integer
  //   await bnb.createAccount('Host', { from: host })
  //   try {
  //     await bnb.createListing(COUNTRIES.GB, 'London', priceWei, { from: host, value: stakeWei })
  //     assert(false, 'Should have thrown an exception')
  //   } catch (e) {
  //     // Pass
  //   }
  // })

  // it('listingCreate works when the host provides an acceptable stake (n x price)', async () => {
  //   const bnb = await EthBnB.deployed()
  //   const [host] = accounts
  //   const priceFinney = 8
  //   const priceWei = fromFinney(priceFinney) // the acutal house price in wei
  //   const stakeWei1 = fromFinney(priceFinney * 2) // value staked by the host
  //   const stakeWei2 = fromFinney(priceFinney * 3) // value staked by the host
  //   await bnb.createAccount('Host', { from: host })
  //   try {
  //     await bnb.createListing(COUNTRIES.GB, 'London', priceWei, { from: host, value: stakeWei1 })
  //     await bnb.createListing(COUNTRIES.GB, 'Paris', priceWei, { from: host, value: stakeWei2 })
  //   } catch (e) {
  //     assert(false)
  //   }
  // })

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
    assert(false, 'Not implemented')
  })

  it('User must increase stake in order to set the price', async() => {
    assert(false, 'Not implemented')
  })

  it('Contract refunds the guest if the booking fails', async () => {
    assert(false, 'Not implemented')
  })


  // it('Neither host nor guest can rate before booking end', async () => {
  //   let lid
  //   let res
  //   let bid
  //   const bnb = await EthBnB.deployed()
  //   const [host, guest] = accounts
  //   const priceFinney = 800
  //   const priceWei = fromFinney(priceFinney)
  //   const stakeWei = fromFinney(priceFinney * 3)
  //   const guestStakeWei = fromFinney(priceFinney * 2)
  //   // We create accounts and a listing providing a valid stake (x3)
  //   await bnb.createAccount('Host', { from: host })
  //   await bnb.createAccount('Guest', { from: guest })
  //   res = await bnb.createListing(COUNTRIES.GB, 'London', priceWei, { from: host, value: stakeWei })
  //   truffleAssert.eventEmitted(res, 'CreateListingEvent', ev => lid = ev.lid)
  //   // Guest books the listing and provides appropriate payment
  //   res = await bnb.listingBook(lid, feb2019(7), 1, { from: guest, value: guestStakeWei })
  //   truffleAssert.eventEmitted(res, 'BookingComplete', ev => bid = ev.bid)
  //   // Host rates the guest
  //   try {
  //     res = await bnb.rate(lid, bid, 4, { from: host })
  //   } catch(err) {
  //     return
  //   }
  //   assert(false, 'Rating should fail because the booking has not elapsed')
  // })
})
