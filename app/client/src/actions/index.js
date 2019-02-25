import { SERVER_NODE_URL } from '../constants/global'

export const REFRESH_ETH = 'REFRESH_ETH'
export const REQUEST_LISTINGS = 'REQUEST_LISTINGS'
export const RECEIVE_LISTINGS = 'RECEIVE_LISTINGS'

export const refreshEth = eth => ({ type: REFRESH_ETH, payload: eth })

// Dispatched before we want to request listings, the view should show a spinner
function requestListings() {
  return {
    type: REQUEST_LISTINGS,
  }
}

// Dispatched when the listings have been received from the remote backend
// and we want to update the view
function receiveListings(data) {
  return {
    type: RECEIVE_LISTINGS,
    listings: data,
  }
}

function fetchListings() {
  return (dispatch) => {
    dispatch(requestListings())
    return fetch(`${SERVER_NODE_URL}api/listings`)
      .then(response => response.json())
      .then(json => dispatch(receiveListings(json)))
  }
}

function shouldFetchListings(state) {
  if (state.listings === null) {
    return true
  }
  if (state.isFetching) {
    return false
  }
  return false
}

// TODO: add searchOptions to this function
//       pass them along to fetchListings - which should
//       tailor the API hostname based on what we need
export function fetchListingsIfNeeded() {
  return (dispatch, getState) => {
    if (shouldFetchListings(getState())) {
      return dispatch(fetchListings())
    }
  }
}
