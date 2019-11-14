const truffleAssert = require('truffle-assertions')
const Ethbnb = artifacts.require('Ethbnb')

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

contract('Ethbnb', async (accounts) => {
  const d = { from: accounts[0] }

  // Eth account that has no corresponding 'Account' in Ethbnb contract
  const UNUSED_ACCOUNT = accounts[8]

  // Checks that hasAccount() returns false when no account has been created
  it('Account: hasAcccount() returns false when no account has been created', async () => {
    const bnb = await Ethbnb.deployed()
    const [a0, a1] = accounts
    const account0Exists = await bnb.hasAccount.call({ from: a0 })
    const account1Exists = await bnb.hasAccount.call({ from: a1 })
    assert.isFalse(account0Exists, 'Account 0 exists for some reason, shouldn\'t be the case')
    assert.isFalse(account1Exists, 'Account 1 exists for some reason, shouldn\'t be the case')
  })

  // Check that we can create an account
  it('Account: hasAccount() createAccount() are correct', async () => {
    const bnb = await Ethbnb.deployed()
    const NAME = 'Alex'
    const [a0] = accounts
    await bnb.createAccount(NAME, { from: a0 })

    // Check the account exists
    const accountExists = await bnb.hasAccount({ from: a0 })
    assert.isTrue(accountExists, 'createAccount doesn\'t seem to have created an account')

    const res = await bnb.getAccountAll(a0, {from: a0})
    const { name: actualName, dateCreated: actualDatedCreated,
            totalScore: actualTotalScore, nRatings: actualNRatings } = res
    assert.equal(actualName, NAME, 'The account shortName does not match what we expect')
  })

  // Create listing without an account
  it('Listing: createListing() fails when user has no \'Account\'', async () => {
    const bnb = await Ethbnb.deployed()
    // Create a listing
    try {
      const imageCID = ''
      const imageCIDSource = ''
      await bnb.createListing(COUNTRIES.GB, 'London', 5000, { from: UNUSED_ACCOUNT })
      assert(false, 'Should have thrown an exception')
    } catch (error) {
      // Test pass
      // TODO: check the exception message here
    }
  })

  // Check that we can create a listing returning a positive listing Id
  it('Listing: createListing() correct', async () => {
    let res
    const [a0] = accounts
    const bnb = await Ethbnb.deployed()
    res = await bnb.createAccount('Alex', { from: a0 })
    const lid = await createListingDefault(bnb, a0)
    assert (lid > 0, 'The listing id should be greater than zero')
  })

  it('Listing can be booked', async () => {
    let res
    const [host, guest] = accounts
    const bnb = await Ethbnb.deployed()
    res = await bnb.createAccount('Alex', { from: host })
    res = await bnb.createAccount('Mark', { from: guest })
    const lid = await createListingDefault(bnb, host)
    await bookListingDefault(bnb, guest, lid, feb2019(10), 3)
  })

  it('Listing can be deleted and cannot be accessed afterwards', async () => {
    let res
    const [host] = accounts
    const bnb = await Ethbnb.deployed()
    res = await bnb.createAccount('Alex', { from: host })
    let lid = await createListingDefault(bnb, host)
    res = await bnb.deleteListing(lid)
    truffleAssert.eventEmitted(res, 'DeleteListingEvent', ev => lid = ev.lid)
    // We expect the below to fail since there is no such listing
    try {
        let x = await bnb.getListingAll(lid);
    } catch(e) {
        assert(e.toString().search('Invalid listing identifier') > -1, 'The exception message did not match expectations')
        return
    }
    assert(false, 'Should have thrown exception as there is should be no listing after deletion.')
  })

  it('Two bookings on the same listing have different bids.', async () => {
    let res
    const bnb = await Ethbnb.deployed()
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
    const bnb = await Ethbnb.deployed()
    res = await bnb.createAccount('Alex', { from : accounts[0] })
    res = await bnb.createAccount('Mary', { from : accounts[1] })
    const lid = await createListingDefault(bnb, accounts[0])
    const bid = await bookListingDefault(bnb, accounts[1], lid, feb2019(10), 3)
    res = await bnb.cancelBooking(bid, { from: accounts[0] })
    truffleAssert.eventEmitted(res, 'BookingCancelled')
  })

  it('Listing: Owner cannot book their own listing', async () => {
    let res
    const bnb = await Ethbnb.deployed()
    res = await bnb.createAccount('Alex', { from : accounts[0] })
    const lid = await createListingDefault(bnb, accounts[0])
    try {
      await bnb.bookListing(lid, feb2019(10), 3, { from: accounts[0], value: fromFinney(2 * DEFAULT_LISTING_PRICE)})
    } catch (err) {
      assert(err.toString().search('Owner cannot book their own listing') > -1, 'Unexpected exception message')
      return
    }
    assert(false, 'bookListing should have failed')
  })

  it('Listing: Deleting a listing fails when there are unfinished bookings', async () => {
    let res
    const bnb = await Ethbnb.deployed()
    const futureDate = new Date('3119-02-11').getTime() / 1000
    const [host] = accounts
    res = await bnb.createAccount('Alex', { from: host })
    let lid = await createListingDefault(bnb, accounts[0])
    // Make a booking way in the future ensuring it's end-date will be
    // less than the block.timestamp
    const bid = await bookListingDefault(bnb, accounts[1], lid, futureDate, 3)
    // deleteListing should fail
    try {
      res = await bnb.deleteListing(lid)
    } catch(err) {
      assert(err.toString().search('Cannot delete listing with active bookings') > -1, 'Unexpected exception message')
      return
    }
    assert(false, 'deleteListing should have failed')
  })

  it('Listing: getListingAll() returns correct details', async () => {
    let lid
    const bnb = await Ethbnb.deployed()
    const [host] = accounts
    await bnb.createAccount('Alex', { from: host })
    const LOCATION = 'London'
    const PRICE = 5000
    const COUNTRY = COUNTRIES.GB
    const imageCID = ''
    const imageCIDSource = ''
    const { from: OWNER } = d
    let res = await bnb.createListing(COUNTRY, LOCATION, PRICE, { from: accounts[0], value: fromFinney(DEFAULT_LISTING_PRICE * 2) })
    truffleAssert.eventEmitted(res, 'CreateListingEvent', ev => lid = ev.lid)
    res = await bnb.getListingAll(lid, { from: host })
    const { location: actualLocation, owner: actualOwner, price: actualPrice, country: actualCountry } = res
    assert.equal(actualLocation, LOCATION)
    assert.equal(bigNumberToInt(actualPrice), PRICE)
    assert.equal(actualOwner, OWNER)
    assert.equal(bigNumberToInt(actualCountry), COUNTRY)
  })

  it('Listing: setListing works and emits UpdateListingEvent', async () => {
    let lid
    const [host] = accounts
    const bnb = await Ethbnb.deployed()
    await bnb.createAccount('Alex', { from : host})
    const LOCATION = 'London'
    const PRICE = 5000
    const COUNTRY = COUNTRIES.GB
    const d = { from: host, value: fromFinney(DEFAULT_LISTING_PRICE * 2) }
    let res = await bnb.createListing(COUNTRY, LOCATION, PRICE, { from: host })
    truffleAssert.eventEmitted(res, 'CreateListingEvent', ev => lid = ev.lid)

    const newPrice = 500
    const newLocation = 'Paris'
    const newCountry = COUNTRIES.FR
    res = await bnb.setListing(lid, newPrice, newLocation, newCountry, { from : host })
    truffleAssert.eventEmitted(res, 'UpdateListingEvent')

    res = await bnb.getListingAll(lid, { from: host })
    const {
      location: actualLocation,
      price: actualPrice,
      country: actualCountry
    } = res
    assert.equal(actualLocation, newLocation)
    assert.equal(bigNumberToInt(actualPrice), newPrice)
    assert.equal(bigNumberToInt(actualCountry), newCountry)
  })

  it('Listing: setListingImage works and emits UpdateListingEvent', async () => {
    let lid
    const [host] = accounts
    const bnb = await Ethbnb.deployed()
    await bnb.createAccount('Alex', { from : host})
    const LOCATION = 'London'
    const PRICE = 5000
    const COUNTRY = COUNTRIES.GB
    const imageCID = ''
    const imageCIDSource = ''
    const d = { from: host, value: fromFinney(DEFAULT_LISTING_PRICE * 2) }
    let res = await bnb.createListing(COUNTRY, LOCATION, PRICE, { from: host })
    truffleAssert.eventEmitted(res, 'CreateListingEvent', ev => lid = ev.lid)

    const newImageCID = 'abcdefgh1'
    const newImageCIDSource = 'ipfs'
    res = await bnb.setListingImage(lid, newImageCID, newImageCIDSource, { from : host })
    truffleAssert.eventEmitted(res, 'UpdateListingEvent')

    res = await bnb.getListingAll(lid, { from: host })
    const { imageCID: actualImageCID, imageCIDSource: actualImageCIDSource } = res
    assert.equal(actualImageCID, newImageCID)
    assert.equal(actualImageCIDSource, newImageCIDSource)
  })

  // // TODO: rework this test case
  // // Test get/set listing price
  // it('Listing: get/set listing price()', async () => {
  //   let lid
  //   const bnb = await Ethbnb.deployed()
  //   await bnb.createAccount('Alex', d)
  //   const LOCATION = 'London'
  //   const PRICE = 5000
  //   const COUNTRY = COUNTRIES.GB
  //   let res = await bnb.createListing(COUNTRY, LOCATION, PRICE, { from: accounts[0], value: fromFinney(DEFAULT_LISTING_PRICE * 2) })
  //   truffleAssert.eventEmitted(res, 'CreateListingEvent', ev => lid = ev.lid)
  //   // Change it to 500
  //   const newPrice = 500
  //   await bnb.setListingPrice(lid, newPrice, { from: accounts[0] })
  //   res = await bnb.getListingAll(lid)
  //   assert.equal(bigNumberToInt(res.price), newPrice)
  // })

  it('Cannot cancel in-existent booking', async () => {
    let res
    const bnb = await Ethbnb.deployed()
    res = await bnb.createAccount('Alex', { from: accounts[0] })
    const lid = await createListingDefault(bnb, accounts[0])
    try {
      res = await bnb.cancelBooking(lid, /* in-existent id */ 128348, { from: accounts[0] })
    } catch (err) {
      return
    }
    assert(false, 'cancelBooking should have failed')
  })

  // TODO: implement cancelBooking
  // it('Only booking owner can cancel it', async () => {
  //   let res
  //   const bnb = await Ethbnb.deployed()
  //   res = await bnb.createAccount('Alex', { from : accounts[0] })
  //   res = await bnb.createAccount('Mary', { from : accounts[1] })
  //   res = await bnb.createAccount('John', { from : accounts[2] })
  //   const lid = await createListingDefault(bnb, accounts[0])
  //   const bid = await bookListingDefault(bnb, accounts[1], lid, feb2019(10), 3)
  //   try {
  //     res = await bnb.cancelBooking(lid, bid, { from: accounts[2] })
  //   } catch (err) {
  //     console.log('the message we got is', err)
  //     return
  //   }
  //   assert(false, 'Expected cancelBooking to fail')
  // })

  // A host has two listings, and gets a booking for each.
  // His guests rate him
  it('Rating: a user twice, check their totalScore and nRatings', async () => {
    let res
    const bnb = await Ethbnb.deployed()
    res = await bnb.createAccount('Host', { from: accounts[0] })
    res = await bnb.createAccount('Guest1', { from: accounts[1] })
    res = await bnb.createAccount('Guest2', { from: accounts[2] })
    const lid1 = await createListingDefault(bnb, accounts[0])
    const lid2 = await createListingDefault(bnb, accounts[0])
    const bid1 = await bookListingDefault(bnb, accounts[1], lid1, feb2019(10), 3)
    const bid2 = await bookListingDefault(bnb, accounts[2], lid2, feb2019(10), 3)

    // Two ratings from the two users
    res = await bnb.rate(bid1, 1, { from: accounts[1] })
    truffleAssert.eventEmitted(res, 'RatingComplete')
    res = await bnb.rate(bid2, 5, { from: accounts[2] })
    truffleAssert.eventEmitted(res, 'RatingComplete')
    res = await bnb.getAccountAll(accounts[0], { from: accounts[5] })
    const { totalScore, nRatings } = res
    assert(bigNumberToInt(totalScore) === 5 + 1, 'Total score must be 6')
    assert(bigNumberToInt(nRatings) === 2, 'Total number of ratings must be 2')

    // The host rates one of the users
    res = await bnb.rate(bid1, 4, { from: accounts[0] })
    truffleAssert.eventEmitted(res, 'RatingComplete')
  })

  it('Rating: Cannot rate a booking twice', async () => {
    let res
    let lid1; let bid1
    const bnb = await Ethbnb.deployed()
    res = await bnb.createAccount('Host', { from: accounts[0] })
    res = await bnb.createAccount('Guest1', { from: accounts[1] })
    const lid = await createListingDefault(bnb, accounts[0])
    const bid = await bookListingDefault(bnb, accounts[1], lid, feb2019(10), 3)
    res = await bnb.rate(bid, 1, { from: accounts[1] })
    truffleAssert.eventEmitted(res, 'RatingComplete')
    let errorWasThrown = false
    try {
      res = await bnb.rate(bid, 5, { from: accounts[1] })
    } catch (err) {
      errorWasThrown = true
    }
    assert(errorWasThrown, 'Second time rating should have failed')
  })

  it('Rating: Number of stars must be in [1,5]', async () => {
    let res
    let lid1; let
      bid1
    const bnb = await Ethbnb.deployed()
    res = await bnb.createAccount('Host', { from: accounts[0] })
    res = await bnb.createAccount('Guest1', { from: accounts[1] })
    const lid = await createListingDefault(bnb, accounts[0])
    const bid = await bookListingDefault(bnb, accounts[1], lid, feb2019(10), 3)
    let errorWasThrown = false
    try {
      res = await bnb.rate(bid, 0, { from: accounts[1] })
    } catch (err) {
      errorWasThrown = true
    }
    assert(errorWasThrown, 'Rating below 1 should have failed')
    errorWasThrown = false
    try {
      res = await bnb.rate(bid, 6, { from: accounts[0] })
    } catch (err) {
      errorWasThrown = true
    }
    assert(errorWasThrown, 'Rating above 5 should have failed')
  })

  it('Rating: only users in the booking can rate it', async () => {
    let res
    let lid1; let
      bid1
    const bnb = await Ethbnb.deployed()
    res = await bnb.createAccount('Host', { from: accounts[0] })
    res = await bnb.createAccount('Guest1', { from: accounts[1] })
    res = await bnb.createAccount('Guest1', { from: accounts[2] })
    const lid = await createListingDefault(bnb, accounts[0])
    const bid = await bookListingDefault(bnb, accounts[1], lid, feb2019(10), 3)
    let errorWasThrown = false
    try {
      res = await bnb.rate(bid, 1, { from: accounts[2] })
    } catch (err) {
      errorWasThrown = true
    }
    assert(errorWasThrown, 'Should have failed since account[2] did not participate in the booking')
  })

  it('Rating: cannot rate before booking\'s end_date\'', async () => {
    let res
    const bnb = await Ethbnb.deployed()
    const date = new Date('3119-02-11').getTime() / 1000
    res = await bnb.createAccount('Host', { from: accounts[0] })
    res = await bnb.createAccount('Guest1', { from: accounts[1] })
    const lid = await createListingDefault(bnb, accounts[0])
    const bid = await bookListingDefault(bnb, accounts[1], lid, date, 3)
    try {
      res = await bnb.rate(bid, 1, { from: accounts[1] })
    } catch (err) {
      assert(err.toString().search('Cannot rate a booking before it ends') > -1, 'Unexpected exception message')
      return
    }
    assert(false, 'Should not be able to rate a booking whose end date is in the future')
  })

})
