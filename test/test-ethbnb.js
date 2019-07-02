const truffleAssert = require('truffle-assertions')

const EthBnB = artifacts.require('EthBnB')

const COUNTRIES = {
  AF: 0, AL: 1, DZ: 2, AS: 3, AD: 4, AO: 5, AI: 6, AQ: 7, AG: 8, AR: 9, AM: 10, AW: 11, AU: 12, AT: 13, AZ: 14, BS: 15, BH: 16, BD: 17, BB: 18, BY: 19, BE: 20, BZ: 21, BJ: 22, BM: 23, BT: 24, BO: 25, BA: 26, BW: 27, BV: 28, BR: 29, IO: 30, BN: 31, BG: 32, BF: 33, BI: 34, KH: 35, CM: 36, CA: 37, CV: 38, KY: 39, CF: 40, TD: 41, CL: 42, CN: 43, CX: 44, CC: 45, CO: 46, KM: 47, CG: 48, CD: 49, CK: 50, CR: 51, CI: 52, HR: 53, CU: 54, CY: 55, CZ: 56, DK: 57, DJ: 58, DM: 59, DO: 60, TP: 61, EC: 62, EG: 63, SV: 64, GQ: 65, ER: 66, EE: 67, ET: 68, FK: 69, FO: 70, FJ: 71, FI: 72, FR: 73, GF: 74, PF: 75, TF: 76, GA: 77, GM: 78, GE: 79, DE: 80, GH: 81, GI: 82, GR: 83, GL: 84, GD: 85, GP: 86, GU: 87, GT: 88, GN: 89, GW: 90, GY: 91, HT: 92, HM: 93, VA: 94, HN: 95, HK: 96, HU: 97, IS: 98, IN: 99, ID: 100, IR: 101, IQ: 102, IE: 103, IL: 104, IT: 105, JM: 106, JP: 107, JO: 108, KZ: 109, KE: 110, KI: 111, KP: 112, KR: 113, KV: 114, KW: 115, KG: 116, LA: 117, LV: 118, LB: 119, LS: 120, LR: 121, LY: 122, LI: 123, LT: 124, LU: 125, MO: 126, MK: 127, MG: 128, MW: 129, MY: 130, MV: 131, ML: 132, MT: 133, MH: 134, MQ: 135, MR: 136, MU: 137, YT: 138, MX: 139, FM: 140, MD: 141, MC: 142, MN: 143, MS: 144, ME: 145, MA: 146, MZ: 147, MM: 148, NA: 149, NR: 150, NP: 151, NL: 152, AN: 153, NC: 154, NZ: 155, NI: 156, NE: 157, NG: 158, NU: 159, NF: 160, MP: 161, NO: 162, OM: 163, PK: 164, PW: 165, PS: 166, PA: 167, PG: 168, PY: 169, PE: 170, PH: 171, PN: 172, PL: 173, PT: 174, PR: 175, QA: 176, RE: 177, RO: 178, RU: 179, RW: 180, SH: 181, KN: 182, LC: 183, PM: 184, VC: 185, WS: 186, SM: 187, ST: 188, SA: 189, SN: 190, RS: 191, SC: 192, SL: 193, SG: 194, SK: 195, SI: 196, SB: 197, SO: 198, ZA: 199, GS: 200, ES: 201, LK: 202, SD: 203, SR: 204, SJ: 205, SZ: 206, SE: 207, CH: 208, SY: 209, TW: 210, TJ: 211, TZ: 212, TH: 213, TG: 214, TK: 215, TO: 216, TT: 217, TN: 218, TR: 219, TM: 220, TC: 221, TV: 222, UG: 223, UA: 224, AE: 225, GB: 226, US: 227, UM: 228, UY: 229, UZ: 230, VU: 231, VE: 232, VN: 233, VG: 234, VI: 235, WF: 236, EH: 237, YE: 238, ZM: 239, ZW: 240,
}

const bigNumberToInt = bn => parseInt(bn.toString())

/**
 * Convenience function
 *
 * @param  {int} dayNb in range [1..28]
 * @return {int} seconds timestamp of date in Feb 2019
 *               e.g. feb2019(10) returns the timestamp of 10/02/2019
 *               which is 1549756800
 */
const feb2019 = dayNb => new Date(`2019-02-${dayNb}`).getTime() / 1000
const fromFinney = price => web3.utils.toWei(`${price}`, 'finney')

const BOOKING_CAPACITY = 5  // TODO: would be better to read this from the contract
const DEFAULT_LISTING_PRICE = 8
const DEFAULT_LISTING_PRICE_WEI = fromFinney(DEFAULT_LISTING_PRICE)

contract('EthBnB', async (accounts) => {
  const d = { from: accounts[0] }

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

  /**
   * Books the listing using default values.
   *
   * @bnb                         the deployed contract
   * @account                     the account that should book the listing
   * @lid, fromDate, nbOfDays     same parameters that would have otherwise been passed to listingBook
   */
  const bookListingDefault = async (bnb, account, lid, fromDate, nbOfDays) => {
    let bid
    res = await bnb.listingBook(lid, fromDate, nbOfDays, { from: account, value: fromFinney(DEFAULT_LISTING_PRICE * 2) })
    truffleAssert.eventEmitted(res, 'BookingComplete', ev => bid = ev.bid)
    return bid
  }

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
    // res = await bnb.listingBook(lid, feb2019(10), 3)
    // truffleAssert.eventEmitted(res, 'BookingComplete', ev => bid = ev.bid)
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

  it('Rating: users can only rate their bookings', async () => {
    let res
    let lid1; let
      bid1
    const bnb = await EthBnB.deployed()
    // Accounts
    res = await bnb.createAccount('Host', { from: accounts[0] })
    res = await bnb.createAccount('Guest1', { from: accounts[1] })
    res = await bnb.createAccount('Guest1', { from: accounts[2] })
    // Listing
    res = await bnb.createListing(COUNTRIES.GB, 'London', 5000, { from: accounts[0] })
    truffleAssert.eventEmitted(res, 'CreateListingEvent', ev => lid1 = ev.lid)
    // Booking
    res = await bnb.listingBook(lid1, feb2019(10), 3, { from: accounts[1] })
    truffleAssert.eventEmitted(res, 'BookingComplete', ev => bid1 = ev.bid)
    let errorWasThrown = false
    try {
      res = await bnb.rate(lid1, bid1, 1, { from: accounts[2] })
    } catch (err) {
      errorWasThrown = true
    }
    assert(errorWasThrown, 'Should have failed since account[2] did not participate in the booking')
  })

  it('Rating: cannot rate before booking\'send_date\'', async () => {
    let res
    let lid1
    let bid1
    const bnb = await EthBnB.deployed()
    // Accounts
    res = await bnb.createAccount('Host', { from: accounts[0] })
    res = await bnb.createAccount('Guest1', { from: accounts[1] })
    // Listing
    res = await bnb.createListing(COUNTRIES.GB, 'London', 5000, { from: accounts[0] })
    truffleAssert.eventEmitted(res, 'CreateListingEvent', ev => lid1 = ev.lid)
    // Booking
    // this test might fail in the year 3119. Oh no!
    const date = new Date('3119-02-11').getTime() / 1000
    res = await bnb.listingBook(lid1, date, 5, { from: accounts[1] })
    truffleAssert.eventEmitted(res, 'BookingComplete', ev => bid1 = ev.bid)
    let errorWasThrown = false
    try {
      res = await bnb.rate(lid1, bid1, 1, { from: accounts[1] })
    } catch (err) {
      errorWasThrown = true
    }
    assert(errorWasThrown, 'Should not be able to rate a booking whose end date is in the future')
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
