import TruffleContract from 'truffle-contract'
import { SERVER_NODE_URL } from '../constants/global'

// ============================================================
// EXPORT ACTIONS
// ============================================================

export const SET_SEARCH_OPTIONS = 'SET_SEARCH_OPTIONS'
export const REQUEST_LISTINGS = 'REQUEST_LISTINGS'
export const RECEIVE_LISTINGS = 'RECEIVE_LISTINGS'
export const BOOK_LISTING = 'BOOK_LISTING'
export const SET_WEB3 = 'SET_WEB3'

// ============================================================
// FUNCTIONS
// ============================================================

const isSet = val => val !== null && typeof (val) !== 'undefined'

// Dispatched before we want to request listings, the view should show a spinner
const requestListings = () => ({
  type: REQUEST_LISTINGS,
})

// Dispatched when the listings have been received from the remote backend
// and we want to update the view
const receiveListings = data => ({
  type: RECEIVE_LISTINGS,
  listings: data,
})

const getListingsURI = (opts) => {
  const params = (isSet(opts)) ? opts : {}
  for (const key in params) {
    if (params[key] === null) {
      delete params[key]
    }
  }
  const queryString = Object.keys(params).map(key => `${key}=${params[key]}`).join('&')
  return `${SERVER_NODE_URL}api/listings?${queryString}`
}

const shouldFetchListings = (state) => {
  if (state.listings === null) {
    return true
  }
  if (state.isFetching) {
    return false
  }
  return false
}

const fetchListingsUsingOptions = (dispatch, state) => {
  // The server expects 'from_date' and 'to_date' in underscore format
  // whereas the client uses camelCase. We convert below.
  let opts
  if (isSet(state.searchOptions)) {
    const { fromDate, toDate, countryCode } = state.searchOptions
    opts = {
      from_date: (fromDate) ? fromDate.getTime() / 1000 : null,
      to_date: (toDate) ? toDate.getTime() / 1000 : null,
      country_code: countryCode,
    }
  } else {
    opts = {}
  }
  const uri = getListingsURI(opts)
  return fetch(uri)
    .then(response => response.json())
    .then(json => dispatch(receiveListings(json)))
}

// ============================================================
// EXPORT FUNCTIONS
// ============================================================

export const bookListing = (contract, ethAddr, lid, fromDate, toDate) => {
  const obj = {
    from: ethAddr,
    gas: 1000000,
  }
  if (!contract) {
    console.log('Cannot make booking when contract is not setup')
    return
  }
  if (!fromDate || !toDate) {
    console.log('Book button should be disabled when dates are not set.')
    return
  }
  const lid1 = parseInt(lid, 10)
  const nbOfDays = (toDate - fromDate) / (86400000) // number of milliseconds per day
  const fromDate1 = fromDate.getTime() / 1000

  // ESTIMATE GAS:
  //
  // contract.contract.methods.listingBook(lid1, fromDate1, nbOfDays)
  //   .estimateGas(obj)
  //   .then((err, amount) => {
  //     console.log(err)
  //     console.log(amount)
  //   })
  contract.listingBook(lid1, fromDate1, nbOfDays, obj).then((res) => {
    console.log('listingBook submitted')
    console.log(res)
  }).catch((err) => {
    // TODO: show user alert
    console.log('error from listingBook')
    console.log(err)
  })
  return {
    type: BOOK_LISTING,
    ethAddr,
    lid,
    fromDate,
    toDate,
  }
}

export const setWeb3Js = (web3js) => {
  return (dispatch) => {
    const { jsonInterface } = window.contractDetails
    const MyContract = TruffleContract(jsonInterface)
    MyContract.setProvider(web3js.currentProvider)
    web3js.eth.getAccounts()
      .then(accounts => accounts[0])
      .then((accountAddr) => {
        MyContract.deployed()
          .then(contract => dispatch({
            type: SET_WEB3,
            web3js,
            contract,
            accountAddr,
          }))
      })
  }
}

export const setSearchOptions = opts => ({
  type: SET_SEARCH_OPTIONS,
  opts,
})

export function fetchListings() {
  return (dispatch, getState) => {
    dispatch(requestListings())
    return fetchListingsUsingOptions(dispatch, getState())
  }
}

// TODO: add searchOptions to this function
//       pass them along to fetchListings - which should
//       tailor the API hostname based on what we need
export function fetchListingsIfNeeded(opts) {
  return (dispatch, getState) => {
    if (shouldFetchListings(getState())) {
      return dispatch(fetchListings(opts))
    }
  }
}
