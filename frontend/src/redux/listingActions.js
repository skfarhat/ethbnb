import {
  API_URL,
  SERVER_POST_NEW_LISTING,
  isSet,
} from '../constants/global'

import { contractCall } from './actions'
import { fetchPublicAccount } from './accountActions'

// ============================================================
// EXPORT ACTIONS
// ============================================================
//
const REQUEST_LISTINGS = 'REQUEST_LISTINGS'
const RECEIVE_LISTINGS = 'RECEIVE_LISTINGS'

// ============================================================
// EXPORT FUNCTIONS
// ============================================================

const getListingsURL = (opts) => {
  const params = (isSet(opts)) ? opts : {}
  for (const key in params) {
    if (params[key] === null) {
      delete params[key]
    }
  }
  const queryString = Object.keys(params).map(key => `${key}=${params[key]}`).join('&')
  console.log(`${API_URL}/listings?${queryString}`)
  return `${API_URL}/listings?${queryString}`
}

const createListing = (chaindata, metadata, userAddr, other) => {
  return (dispatch) => {
    // 1. Send chain-data to blockchain and receive the transactionHash
    dispatch(contractCall('createListing', chaindata, userAddr, other))
      .then((tx) => {
        // 2. Get the transaction hash from the tx object
        // and send metadata to the backend
        fetch(SERVER_POST_NEW_LISTING, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...metadata,
            txHash: tx.transactionHash,
          }),
        }).then((res) => {
          console.log('success posting the metadata, and we got back', res)
        }).catch((err, data) => {
          // TODO: show message on the UI
          console.log('Error posting metadata to backend', err, data)
        })
      })
      .catch((err) => {
        console.log('encountered an error in createListing', err)
      })
  }
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

// Fetch listings using the provided options
//
// @opts    options object containing parameters to fetch listings
//          with. A null, undefined @opts is accepted. Properties
//          with null or undefined values will not be included in the
//          search.
//          At the time writing, valid options include:
//
//          - fromDate: Date
//          - toDate: Date
//          - countrCode: number
const fetchListings = (optsIn) => {
  return (dispatch) => {
    // Options passed in URL
    let opts = {}
    dispatch(({ type: REQUEST_LISTINGS }))

    // Format input options correctly
    if (isSet(optsIn)) {
      const { fromDate, toDate, countryCode } = optsIn
      opts = {
        fromDate: (fromDate) ? fromDate.getTime() / 1000 : null,
        toDate: (toDate) ? toDate.getTime() / 1000 : null,
        // We can pass a null countrCode the backend will handle it well
        countryCode,
      }
    }

    // Fetch listings from backend
    const url = getListingsURL(opts)
    return fetch(url)
      .then(response => response.json())
      .then((listingsJson) => {
        Object.values(listingsJson).forEach((listing) => {
          const { owner } = listing
          dispatch(fetchPublicAccount(owner))
        })
        dispatch(({
          type: RECEIVE_LISTINGS,
          listings: listingsJson,
        }))
      })
  }
}

const fetchListingsIfNeeded = (opts) => {
  return (dispatch, getState) => {
    if (shouldFetchListings(getState())) {
      return dispatch(fetchListings(opts))
    }
  }
}

export {
  REQUEST_LISTINGS,
  RECEIVE_LISTINGS,
  createListing,
  fetchListingsIfNeeded,
  fetchListings,
}
