import {
  REQUEST_LISTINGS,
  RECEIVE_LISTINGS,
  SET_SEARCH_OPTIONS,
  SET_WEB3JS,
  SET_WEB3_CONTRACT,
} from './actions'

const initialState = {
  isFetching: false,
  listings: null,
  searchOptions: {
    fromDate: null,
    toDate: null,
    countryCode: null,
  },
  ethAddress: null,
  webjs: null,
}

const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_WEB3JS: {
      return {
        ...state,
        web3js: action.web3js,
      }
    }
    case SET_WEB3_CONTRACT: {
      return {
        ...state,
        web3Contract: action.web3Contract,
      }
    }
    case SET_SEARCH_OPTIONS: {
      return {
        ...state,
        searchOptions: action.opts,
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
    case 'web3/RECEIVE_ACCOUNT':
      return {
        ...state,
        ethAddress: action.address,
      }
    case 'web3/CHANGE_ACCOUNT':
      return {
        ...state,
        ethAddress: action.address,
      }
    case 'web3/LOGOUT':
      return {
        ...state,
        ethAddress: null,
      }
    default: {
      return state
    }
  }
}

export default rootReducer
