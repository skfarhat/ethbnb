import {
  REQUEST_LISTINGS,
  RECEIVE_LISTINGS,
  SET_SEARCH_OPTIONS,
  SET_WEB3,
  BOOK_LISTING,
} from './actions'

const initialState = {
  isFetching: false,
  listings: null,
  searchOptions: {
    fromDate: null,
    toDate: null,
    countryCode: null,
  },
  accountAddr: null,
  web3: null,
  contract: null,
}

const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_WEB3: {
      return {
        ...state,
        web3: action.web3js,
        contract: action.contract,
        accountAddr: action.accountAddr,
      }
    }
    case SET_SEARCH_OPTIONS: {
      return {
        ...state,
        searchOptions: Object.assign({}, state.searchOptions, action.opts),
      }
    }
    case REQUEST_LISTINGS: {
      return Object.assign({}, state, {
        isFetching: true,
        // didInvalidate: false,
      })
    }
    case RECEIVE_LISTINGS:
      return Object.assign({}, state, {
        isFetching: false,
        listings: action.listings,
        lastUpdated: action.receivedAt,
        // didInvalidate: false,
      })
    case BOOK_LISTING: {
      return state
      // TODO: Update the state
    }
    default: {
      return state
    }
  }
}

export default rootReducer
