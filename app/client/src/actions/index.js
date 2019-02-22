import { SERVER_NODE_URL } from '../constants/global'

export const REFRESH_ETH = 'REFRESH_ETH'
export const SELECT_CLIENT = 'SELECT_CLIENT'
export const CREATE_ACCOUNT = 'CREATE_ACCOUNT'
export const CREATE_LISTING = 'CREATE_LISTING'
export const ADD_MESSAGE = 'ADD_MESSAGE'
export const REQUEST_LISTINGS = 'REQUEST_LISTINGS'
export const RECEIVE_LISTINGS = 'RECEIVE_LISTINGS'

export const refreshEth = eth => ({ type: REFRESH_ETH, payload: eth })
export const selectClient = addr => ({ type: SELECT_CLIENT, payload: addr })
export const addMessage = message => ({ type: ADD_MESSAGE, payload: message })

// Client actions
// The payload must be a dictionary with properties: name and value
// where 'name' determines which client property to be updated value in the client
// to be updated in response to the action, and where 'value' determines the new value
// that the peroperty should be updated to.
export const createAccount = account => ({ type: CREATE_ACCOUNT, payload: { name: 'account', value: account } })
export const createListing = listing => ({ type: CREATE_LISTING, payload: { name: 'listing', value: listing } })


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

export function fetchListingsIfNeeded() {
  return (dispatch, getState) => {
    if (shouldFetchListings(getState())) {
      return dispatch(fetchListings())
    }
  }
}


// function fetchListings(country, from_date, to_date) {
//   return dispatch => {
//     dispatch(requestPosts(subreddit))
//     return fetch(`https://www.reddit.com/r/${subreddit}.json`)
//       .then(response => response.json())
//       .then(json => dispatch(receivePosts(subreddit, json)))
//   }
// }
