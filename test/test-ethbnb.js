const truffleAssert = require('truffle-assertions')
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
} = require('./test-utils')

contract('EthBnB', async (accounts) => {
  const d = { from: accounts[0] }

  // Eth account that has no corresponding 'Account' in EthBnB contract
  const UNUSED_ACCOUNT = accounts[8]

  // Checks that hasAccount() returns false when no account has been created
  it('Account: hasAcccount() returns false when no account has been created', async () => {
    const bnb = await EthBnB.deployed()
    const account0Exists = await bnb.hasAccount.call({ from: accounts[0] })
    const account1Exists = await bnb.hasAccount.call({ from: accounts[1] })
    assert.isFalse(account0Exists, 'Account 0 exists for some reason, shouldn\'t be the case')
    assert.isFalse(account1Exists, 'Account 1 exists for some reason, shouldn\'t be the case')
  })

  // Check that we can create an account
  it('Account: hasAccount() createAccount() are correct', async () => {
    const bnb = await EthBnB.deployed()
    // Create the account
    const NAME = 'Alex'
    const FROM = accounts[0]
    await bnb.createAccount(NAME, { from: FROM })
    // Check the account exists
    const accountExists = await bnb.hasAccount({ from: FROM })
    assert.isTrue(accountExists, 'createAccount doesn\'t seem to have created an account')

    const res = await bnb.getAccountAll(FROM, {from: FROM})
    const { name: actualName, dateCreated: actualDatedCreated,
            totalScore: actualTotalScore, nRatings: actualNRatings } = res
    assert.equal(actualName, NAME, 'The account shortName does not match what we expect')
  })

  // Create listing without an account
  it('Listing: createListing() fails when user has no \'Account\'', async () => {
    const bnb = await EthBnB.deployed()
    // Create a listing
    try {
      await bnb.createListing(COUNTRIES.GB, 'London', 5000, { from: UNUSED_ACCOUNT })
      assert(false, 'Should have thrown an exception')
    } catch (error) {
    // Test pass
    }
  })

  // Check that we can create a listing returning a positive listing Id
  it('Listing: createListing() correct', async () => {
    let res
    const bnb = await EthBnB.deployed()
    res = await bnb.createAccount('Alex', d)
    const lid = await createListingDefault(bnb, accounts[0])
    assert (lid > 0, 'The listing id should be greater than zero')
  })

  it('Listing can be booked', async () => {
    let res
    const bnb = await EthBnB.deployed()
    res = await bnb.createAccount('Alex', d)
    const lid = await createListingDefault(bnb, accounts[0])
    await bookListingDefault(bnb, accounts[0], lid, feb2019(10), 3)
  })

  it('Listing can be deleted and cannot be accessed afterwards', async () => {
    let res
    const bnb = await EthBnB.deployed()
    res = await bnb.createAccount('Alex', d)
    let lid = await createListingDefault(bnb, accounts[0])
    res = await bnb.listingDelete(lid)
    truffleAssert.eventEmitted(res, 'DeleteListingEvent', ev => lid = ev.lid)
    // We expect the below to fail since there is no such listing
    try {
        let x = await bnb.getListingAll(lid);
    } catch(e) {
        assert(e.toString().search('No such listing found') > -1, 'The exception message did not match expectations')
        return
    }
    assert(false, 'Should have thrown exception as there is should be no listing after deletion.')
  })

  it('Two bookings on the same listing have different bids.', async () => {
    let res
    const bnb = await EthBnB.deployed()
    res = await bnb.createAccount('Alex', { from : accounts[0] })
    res = await bnb.createAccount('Mary', { from : accounts[1] })
    res = await bnb.createAccount('Joey', { from : accounts[2] })
    const lid = await createListingDefault(bnb, accounts[0])
    const bid1 = await bookListingDefault(bnb, accounts[1], lid, feb2019(10), 3)
    const bid2 = await bookListingDefault(bnb, accounts[2], lid, feb2019(20), 3)
    assert.notEqual(bid1, bid2, 'Bookings on the same listing must have different bids.')
  })

  it('Listing can be cancelled', async () => {
    let res
    const bnb = await EthBnB.deployed()
    res = await bnb.createAccount('Alex', { from : accounts[0] })
    res = await bnb.createAccount('Mary', { from : accounts[1] })
    const lid = await createListingDefault(bnb, accounts[0])
    const bid = await bookListingDefault(bnb, accounts[1], lid, feb2019(10), 3)
    // Cancel the booking
    res = await bnb.listingCancel(lid, bid, { from: accounts[0] })
    truffleAssert.eventEmitted(res, 'BookingCancelled')
  })

  it('Cannot cancel inexistent booking', async () => {
    let res
    const bnb = await EthBnB.deployed()
    res = await bnb.createAccount('Alex', { from : accounts[0] })
    const lid = await createListingDefault(bnb, accounts[0])
    // Cancel inexistent booking booking
    res = await bnb.listingCancel(lid, /* inexistent id */ 128348, { from: accounts[0] })
    truffleAssert.eventEmitted(res, 'BookingNotFound')
  })

  it('Cannot book more than capacity', async () => {
    let res
    let bid
    const bnb = await EthBnB.deployed()
    res = await bnb.createAccount('Alex', { from : accounts[0] })
    res = await bnb.createAccount('Mary', { from : accounts[1] })
    const lid = await createListingDefault(bnb, accounts[0])
    for (let i = 0; i < BOOKING_CAPACITY; i++) {
      res = await bnb.listingBook(lid, feb2019(18) + i * 86400, 1, { from: accounts[1], value: fromFinney(DEFAULT_LISTING_PRICE * 2)})
      truffleAssert.eventNotEmitted(res, 'BookingNoMoreSpace')
    }
    res = await bnb.listingBook(lid, /* irrelevant arg */ 23423, 1, { from: accounts[1], value: fromFinney(DEFAULT_LISTING_PRICE * 2)})
    truffleAssert.eventEmitted(res, 'BookingNoMoreSpace')
  })

  it('Listing: getListingAll() returns correct details', async () => {
    let lid
    const bnb = await EthBnB.deployed()
    await bnb.createAccount('Alex', d)
    const LOCATION = 'London'
    const PRICE = 5000
    const COUNTRY = COUNTRIES.GB
    const { from: OWNER } = d
    let res = await bnb.createListing(COUNTRY, LOCATION, PRICE, { from: accounts[0], value: fromFinney(DEFAULT_LISTING_PRICE * 2) })
    truffleAssert.eventEmitted(res, 'CreateListingEvent', ev => lid = ev.lid)
    res = await bnb.getListingAll(lid, d)
    const { location: actualLocation, owner: actualOwner, price: actualPrice, country: actualCountry } = res
    assert.equal(actualLocation, LOCATION)
    assert.equal(bigNumberToInt(actualPrice), PRICE)
    assert.equal(actualOwner, OWNER)
    assert.equal(bigNumberToInt(actualCountry), COUNTRY)
  })

  // TODO: rework this test case
  // Test get/set listing price
  it('Listing: get/set listing price()', async () => {
    let lid
    const bnb = await EthBnB.deployed()
    await bnb.createAccount('Alex', d)
    const LOCATION = 'London'
    const PRICE = 5000
    const COUNTRY = COUNTRIES.GB
    let res = await bnb.createListing(COUNTRY, LOCATION, PRICE, { from: accounts[0], value: fromFinney(DEFAULT_LISTING_PRICE * 2) })
    truffleAssert.eventEmitted(res, 'CreateListingEvent', ev => lid = ev.lid)
    // Change it to 500
    const newPrice = 500
    await bnb.setListingPrice(lid, newPrice, { from: accounts[0] })
    res = await bnb.getListingAll(lid)
    assert.equal(bigNumberToInt(res.price), newPrice)
  })

  // A host has two listings, and gets a booking for each.
  // His guests rate him
  it('Rating: a user twice, check their totalScore and nRatings', async () => {
    let res
    const bnb = await EthBnB.deployed()
    res = await bnb.createAccount('Host', { from: accounts[0] })
    res = await bnb.createAccount('Guest1', { from: accounts[1] })
    res = await bnb.createAccount('Guest2', { from: accounts[2] })
    const lid1 = await createListingDefault(bnb, accounts[0])
    const lid2 = await createListingDefault(bnb, accounts[0])
    const bid1 = await bookListingDefault(bnb, accounts[1], lid1, feb2019(10), 3)
    const bid2 = await bookListingDefault(bnb, accounts[2], lid2, feb2019(10), 3)

    // Two ratings from the two users
    res = await bnb.rate(lid1, bid1, 1, { from: accounts[1] })
    truffleAssert.eventEmitted(res, 'RatingComplete')
    res = await bnb.rate(lid2, bid2, 5, { from: accounts[2] })
    truffleAssert.eventEmitted(res, 'RatingComplete')
    res = await bnb.getAccountAll(accounts[0], { from: accounts[5] })
    const { totalScore, nRatings } = res
    assert(bigNumberToInt(totalScore) === 5 + 1, 'Total score must be 6')
    assert(bigNumberToInt(nRatings) === 2, 'Total number of ratings must be 2')

    // The host rates one of the users
    res = await bnb.rate(lid1, bid1, 4, { from: accounts[0] })
    truffleAssert.eventEmitted(res, 'RatingComplete')
  })

  it('Rating: Cannot rate a booking twice', async () => {
    let res
    let lid1; let bid1
    const bnb = await EthBnB.deployed()
    // Accounts
    res = await bnb.createAccount('Host', { from: accounts[0] })
    res = await bnb.createAccount('Guest1', { from: accounts[1] })
    const lid = await createListingDefault(bnb, accounts[0])
    const bid = await bookListingDefault(bnb, accounts[1], lid, feb2019(10), 3)

    // Rating
    res = await bnb.rate(lid, bid, 1, { from: accounts[1] })
    truffleAssert.eventEmitted(res, 'RatingComplete')
    let errorWasThrown = false
    try {
      res = await bnb.rate(lid, bid, 5, { from: accounts[1] })
    } catch (err) {
      errorWasThrown = true
    }
    assert(errorWasThrown, 'Second time rating should have failed')
  })

  it('Rating: Number of stars must be in [1,5]', async () => {
    let res
    let lid1; let
      bid1
    const bnb = await EthBnB.deployed()
    // Accounts
    res = await bnb.createAccount('Host', { from: accounts[0] })
    res = await bnb.createAccount('Guest1', { from: accounts[1] })
    const lid = await createListingDefault(bnb, accounts[0])
    const bid = await bookListingDefault(bnb, accounts[1], lid, feb2019(10), 3)
    let errorWasThrown = false
    try {
      res = await bnb.rate(lid, bid, 0, { from: accounts[1] })
    } catch (err) {
      errorWasThrown = true
    }
    assert(errorWasThrown, 'Rating below 1 should have failed')
    errorWasThrown = false
    try {
      res = await bnb.rate(lid, bid, 6, { from: accounts[0] })
    } catch (err) {
      errorWasThrown = true
    }
    assert(errorWasThrown, 'Rating above 5 should have failed')
  })

  it('Rating: only users in the booking can rate it', async () => {
    let res
    let lid1; let
      bid1
    const bnb = await EthBnB.deployed()
    // Accounts
    res = await bnb.createAccount('Host', { from: accounts[0] })
    res = await bnb.createAccount('Guest1', { from: accounts[1] })
    res = await bnb.createAccount('Guest1', { from: accounts[2] })
    const lid = await createListingDefault(bnb, accounts[0])
    const bid = await bookListingDefault(bnb, accounts[1], lid, feb2019(10), 3)
    let errorWasThrown = false
    try {
      res = await bnb.rate(lid, bid, 1, { from: accounts[2] })
    } catch (err) {
      errorWasThrown = true
    }
    assert(errorWasThrown, 'Should have failed since account[2] did not participate in the booking')
  })

  it('Rating: cannot rate before booking\'s end_date\'', async () => {
    let res
    const bnb = await EthBnB.deployed()
    const date = new Date('3119-02-11').getTime() / 1000
    // Accounts
    res = await bnb.createAccount('Host', { from: accounts[0] })
    res = await bnb.createAccount('Guest1', { from: accounts[1] })
    const lid = await createListingDefault(bnb, accounts[0])
    const bid = await bookListingDefault(bnb, accounts[1], lid, date, 3)
    try {
      res = await bnb.rate(lid, bid, 1, { from: accounts[1] })
    } catch (err) {
      assert(err.toString().search('Cannot rate a booking before') > -1, 'Unexpected exception message')
      return
    }
    assert(false, 'Should not be able to rate a booking whose end date is in the future')
  })

  it('Owner cannot book their own listing', async () => {
    assert(false, 'Not implemented')
  })

  it('Only booking owner can cancel it', async () => {
    assert(false, 'Not implemented')
  })

  it('Listing: setting a listing price fails when there is not enough staked ', async () => {
    assert(false, 'Not implemented')
  })

  it('Listing: Closing a listing fails when there are unfinished bookings', async () => {
    assert(false, 'Not implemented')
  })
})
