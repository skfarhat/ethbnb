const truffleAssert = require('truffle-assertions')

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

const COUNTRIES = {
  AF: 0, AL: 1, DZ: 2, AS: 3, AD: 4, AO: 5, AI: 6, AQ: 7, AG: 8, AR: 9, AM: 10, AW: 11, AU: 12, AT: 13, AZ: 14, BS: 15, BH: 16, BD: 17, BB: 18, BY: 19, BE: 20, BZ: 21, BJ: 22, BM: 23, BT: 24, BO: 25, BA: 26, BW: 27, BV: 28, BR: 29, IO: 30, BN: 31, BG: 32, BF: 33, BI: 34, KH: 35, CM: 36, CA: 37, CV: 38, KY: 39, CF: 40, TD: 41, CL: 42, CN: 43, CX: 44, CC: 45, CO: 46, KM: 47, CG: 48, CD: 49, CK: 50, CR: 51, CI: 52, HR: 53, CU: 54, CY: 55, CZ: 56, DK: 57, DJ: 58, DM: 59, DO: 60, TP: 61, EC: 62, EG: 63, SV: 64, GQ: 65, ER: 66, EE: 67, ET: 68, FK: 69, FO: 70, FJ: 71, FI: 72, FR: 73, GF: 74, PF: 75, TF: 76, GA: 77, GM: 78, GE: 79, DE: 80, GH: 81, GI: 82, GR: 83, GL: 84, GD: 85, GP: 86, GU: 87, GT: 88, GN: 89, GW: 90, GY: 91, HT: 92, HM: 93, VA: 94, HN: 95, HK: 96, HU: 97, IS: 98, IN: 99, ID: 100, IR: 101, IQ: 102, IE: 103, IL: 104, IT: 105, JM: 106, JP: 107, JO: 108, KZ: 109, KE: 110, KI: 111, KP: 112, KR: 113, KV: 114, KW: 115, KG: 116, LA: 117, LV: 118, LB: 119, LS: 120, LR: 121, LY: 122, LI: 123, LT: 124, LU: 125, MO: 126, MK: 127, MG: 128, MW: 129, MY: 130, MV: 131, ML: 132, MT: 133, MH: 134, MQ: 135, MR: 136, MU: 137, YT: 138, MX: 139, FM: 140, MD: 141, MC: 142, MN: 143, MS: 144, ME: 145, MA: 146, MZ: 147, MM: 148, NA: 149, NR: 150, NP: 151, NL: 152, AN: 153, NC: 154, NZ: 155, NI: 156, NE: 157, NG: 158, NU: 159, NF: 160, MP: 161, NO: 162, OM: 163, PK: 164, PW: 165, PS: 166, PA: 167, PG: 168, PY: 169, PE: 170, PH: 171, PN: 172, PL: 173, PT: 174, PR: 175, QA: 176, RE: 177, RO: 178, RU: 179, RW: 180, SH: 181, KN: 182, LC: 183, PM: 184, VC: 185, WS: 186, SM: 187, ST: 188, SA: 189, SN: 190, RS: 191, SC: 192, SL: 193, SG: 194, SK: 195, SI: 196, SB: 197, SO: 198, ZA: 199, GS: 200, ES: 201, LK: 202, SD: 203, SR: 204, SJ: 205, SZ: 206, SE: 207, CH: 208, SY: 209, TW: 210, TJ: 211, TZ: 212, TH: 213, TG: 214, TK: 215, TO: 216, TT: 217, TN: 218, TR: 219, TM: 220, TC: 221, TV: 222, UG: 223, UA: 224, AE: 225, GB: 226, US: 227, UM: 228, UY: 229, UZ: 230, VU: 231, VE: 232, VN: 233, VG: 234, VI: 235, WF: 236, EH: 237, YE: 238, ZM: 239, ZW: 240,
}

const bigNumberToInt = bn => parseInt(bn.toString())

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
  const d = { from: account, value: fromFinney(DEFAULT_LISTING_PRICE * 100) }
  const res = await bnb.createListing(COUNTRIES.GB, 'London', DEFAULT_LISTING_PRICE_WEI, d)
  truffleAssert.eventEmitted(res, 'CreateListingEvent', ev => lid = ev.lid)
  return lid
}

/**
 * Books the listing using default values.
 *
 * @bnb                         the deployed contract
 * @account                     the account that should book the listing
 * @lid, fromDate, nbOfDays     same parameters that would have otherwise been passed to bookListing
 */
const bookListingDefault = async (bnb, account, lid, fromDate, nbOfDays) => {
  let bid
  res = await bnb.bookListing(lid, fromDate, nbOfDays, { from: account, value: fromFinney(DEFAULT_LISTING_PRICE * 2 * nbOfDays) })
  truffleAssert.eventEmitted(res, 'BookingComplete', ev => bid = ev.bid)
  return bid
}

module.exports = {
  BOOKING_CAPACITY,
  DEFAULT_LISTING_PRICE,
  DEFAULT_LISTING_PRICE_WEI,
  COUNTRIES,
  bookListingDefault,
  bigNumberToInt,
  createListingDefault,
  feb2019,
  fromFinney,
}