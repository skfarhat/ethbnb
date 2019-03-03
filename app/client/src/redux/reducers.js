import {
  REQUEST_LISTINGS,
  RECEIVE_LISTINGS,
  SET_SEARCH_OPTIONS,
  SET_WEB3,
  BOOK_LISTING,
  SET_ACCOUNTS,
  SET_SELECTED_ACCOUNT,
  SET_ETH_EVENTS,
} from './actions'

const initialState = {
  isFetching: false,
  listings: null,
  searchOptions: {
    fromDate: null,
    toDate: null,
    countryCode: null,
  },
  selectedAccountIndex: 0,
  accounts: [],
  web3: null,
  contract: null,
  ethEvents: [],
}

const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_WEB3: {
      return {
        ...state,
        web3: action.web3js,
        contract: action.contract,
        accounts: action.accounts,
      }
    }
    case SET_ETH_EVENTS: {
      return {
        ...state,
        ethEvents: action.events,
      }
    }
    case SET_ACCOUNTS: {
      return {
        ...state,
        accounts: action.accounts,
      }
    }
    case SET_SELECTED_ACCOUNT: {
      return {
        ...state,
        selectedAccountIndex: action.selectedAccountIndex,
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
