const truffleAssert = require('truffle-assertions')
var DateBooker = artifacts.require("DateBooker")

const bignumToNum = (bn) => {
  return parseInt(bn.toString())
}

const registerAndGetId = async (booker, capacity, d) =>  {
  let id
  let r = await booker.register(capacity, d)
  truffleAssert.eventEmitted(r, 'Register', (ev) => id = ev.id)
  return id
}

contract('DateBooker', async (accounts) => {
  const d = { from : accounts[0] }
  const CAPACITY = 10
  const FEB_10 = 1549756800 // February 10 2019 - 00:00
  const FEB_15 = 1550188800 // February 15 2019 - 00:00
  const FEB_17 = 1550361600 // February 17 2019 - 00:00
  const FEB_18 = 1550448000 // February 18 2019 - 00:00

  it('Register event fired upon registration', async() => {
    let r
    var booker = await DateBooker.deployed()
    let id = await registerAndGetId(booker, CAPACITY, d)
  })

  it('Returns the correct capacity after registering', async() => {
    let r
    var booker = await DateBooker.deployed()
    let id = await registerAndGetId(booker, CAPACITY, d)
    const actualCapacity = await booker.get_capacity.call(id, d)
    assert.equal(CAPACITY, bignumToNum(actualCapacity), 'Registered and actual capacities don\'t match.')
  })

  it('Cannot find any books when none have been added', async() => {
    let r
    var booker = await DateBooker.deployed()
    let id = await registerAndGetId(booker, CAPACITY, d)
    for (let i = 1; i <= CAPACITY; i++ ) {
      let r = await booker.find_book.call(id, i, d)
      assert.equal(-1, r, 'Return result should be -1')
    }
  })

  it('Different bookings on the same \'id\' have different bids', async() => {
    let r
    let bid1
    let bid2
    var booker = await DateBooker.deployed()
    let id = await registerAndGetId(booker, CAPACITY, d)
    r = await booker.book(id, FEB_15, 1, d)
    truffleAssert.eventEmitted(r, 'Book', (ev) => bid1 = ev.bid)
    r = await booker.book(id, FEB_17, 2, d)
    truffleAssert.eventEmitted(r, 'Book', (ev) => bid2 = ev.bid)
    assert.notEqual(bid1, bid2, 'Bookings should have different bids.')
  })

  it('find_book works for booking just made', async() => {
    let r
    let bid
    var booker = await DateBooker.deployed()
    let id = await registerAndGetId(booker, CAPACITY, d)
    r = await booker.book(id, FEB_15, 2, d)
    truffleAssert.eventEmitted(r, 'Book', (ev) => bid = ev.bid)
    let res = await booker.find_book.call(id, bid, d)
    assert.isAtLeast(bignumToNum(res), 0, 'Must have found created booking')
  })

  it('Size is 0 when no bookings have been made', async() => {
    var booker = await DateBooker.deployed()
    let id = await registerAndGetId(booker, CAPACITY, d)
    let actualSize = await booker.get_size.call(id, d)
    assert.equal(bignumToNum(actualSize), 0, 'Size should be zero when no bookings have been made')
  })

  it('Size is 2 when 2 bookings have been made', async() => {
    var booker = await DateBooker.deployed()
    let id = await registerAndGetId(booker, CAPACITY, d)
    await booker.book(id, FEB_15, 2, d)
    await booker.book(id, FEB_18, 2, d)
    let actualSize = await booker.get_size.call(id, d)
    assert(bignumToNum(actualSize), 2, 'Actual size should be 2')
  })

  it('Book 2, Cancel 1. Check the size.', async() => {
    let r
    let bid
    var booker = await DateBooker.deployed()
    let id = await registerAndGetId(booker, CAPACITY, d)
    r = await booker.book(id, FEB_15, 2, d) // to FEB_17
    r = await booker.book(id, FEB_18, 3, d) // to FEB_21
    truffleAssert.eventEmitted(r, 'Book', (ev) => bid = ev.bid)
    r = await booker.cancel(id, bid, d)
    truffleAssert.eventEmitted(r, 'Cancellation', (ev) => bid = ev.bid)
    let actualSize = await booker.get_size.call(id, d)
    assert.equal(bignumToNum(actualSize), 1, 'Actual size should be 1')
  })

  // No conflict
  // [15/02      17/02]
  //                       [18/02         21/02]
  it('Make two non-conflicting bookings', async() => {
    let r
    var booker = await DateBooker.deployed()
    let id = await registerAndGetId(booker, CAPACITY, d)
    r = await booker.book(id, FEB_15, 2, d)
    truffleAssert.eventNotEmitted(r, 'BookConflict')
    r = await booker.book(id, FEB_18, 3, d)
    truffleAssert.eventNotEmitted(r, 'BookConflict')
  })

  // (1) Detect conflict:
  //
  // [15/02           18/02]
  //          [17/02          20/02]
  it('(1) Conflict on intersecting dates', async() => {
    let r
    var booker = await DateBooker.deployed()
    let id = await registerAndGetId(booker, CAPACITY, d)
    r = await booker.book(id, FEB_15, 3, d)
    truffleAssert.eventEmitted(r, 'Book', (ev) => (true))
    r = await booker.book(id, FEB_17, 3, d)
    truffleAssert.eventEmitted(r, 'BookConflict', (ev) => (true))
  })

  // (2) Detect conflict:
  //
  //         [15/02           18/02]
  // [10/02          16/02]
  it('(2) Conflict on intersecting dates', async() => {
    let r
    var booker = await DateBooker.deployed()
    let id = await registerAndGetId(booker, CAPACITY, d)
    r = await booker.book(id, FEB_15, 3, d)
    truffleAssert.eventEmitted(r, 'Book')
    r = await booker.book(id, FEB_10, 6, d)
    truffleAssert.eventEmitted(r, 'BookConflict')
  })

  // (3) No conflict:
  //
  // [15/02   <- 3 ->   18/02]
  //                    [18/02   <- 2 ->   20/02]
  it('(3) No conflict', async() => {
    let r
    var booker = await DateBooker.deployed()
    let id = await registerAndGetId(booker, CAPACITY, d)
    r = await booker.book(id, FEB_15, 3, d)
    truffleAssert.eventEmitted(r, 'Book')
    truffleAssert.eventNotEmitted(r, 'BookConflict')
    r = await booker.book(id, FEB_18, 2, d)
    truffleAssert.eventEmitted(r, 'Book')
    truffleAssert.eventNotEmitted(r, 'BookConflict')
  })

  it('NoMoreSpace event when capacity is exceeded.', async() => {
    let r
    var booker = await DateBooker.deployed()
    let id = await registerAndGetId(booker, CAPACITY, d)
    for (let i = 0; i < CAPACITY; i++) {
      r = await booker.book(id, FEB_15 + 86400*i, 1, d)
      truffleAssert.eventNotEmitted(r, 'NoMoreSpace')
      truffleAssert.eventNotEmitted(r, 'BookConflict')
    }
    r = await booker.book(id, 71, 72, d) // we don't care about the arguments here
    truffleAssert.eventEmitted(r, 'NoMoreSpace')
  })

  // it('Can read back the dates (from/To) that have been set', async() => {
  //   const ID = 3
  //   const CAPACITY = 5
  //   let bid
  //   var booker = await DateBooker.deployed()
  //   await booker.register(ID, CAPACITY, d)
  //   let fromDate = 5
  //   let toDate = 10
  //   let r = await booker.book(ADDR, fromDate, toDate, d)
  //   truffleAssert.eventEmitted(r, 'Book', (ev) => bid = ev.bid)
  //   r = await booker.get_dates_for_book.call(bid, d)
  //   const [ actualFromDate, actualToDate ] = r
  //   assert.equal(fromDate, bignumToNum(actualFromDate), 'fromDate does not match actual')
  //   assert.equal(toDate, bignumToNum(actualToDate), 'toDate does not match actual')
  // })

})
