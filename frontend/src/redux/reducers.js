
import {
  ADD_PENDING_TX,
  REMOVE_PENDING_TX,
  ADD_MESSAGE,
  REMOVE_MESSAGE,
  SET_ETH_EVENTS,
  SET_SEARCH_OPTIONS,
  SET_WEB3,
} from './actions'

import {
  RECEIVE_LISTINGS,
  REQUEST_LISTINGS,
} from './listingActions'

import {
  SET_ETH_ACCOUNTS,
  SET_ACCOUNT,
  REQUEST_PUBLIC_ACCOUNT,
  RECEIVE_ACCOUNT_INFO,
  SET_PUBLIC_ACCOUNT,
} from './accountActions'

import { isSet, hasKey } from '../constants/global'

const initialState = {
  isFetching: false,
  listings: null,
  searchOptions: {
    fromDate: null,
    toDate: null,
    countryCode: null,
  },
  accounts: null,

  account: null,
  // Fetched from /api/account/:user
  // contains name, addr, bookings, dateCreated
  accountInfo: null,
  web3: null,
  contract: null,
  ethEvents: [],
  pendingTx: {},
  // Store information fetched from '/api/public' here
  // This should be keyed similar to the REST path
  // e.g. /api/public/accounts/{accountAddr} should be under
  // key 'account'
  public: {
    // Stores public account information
    accounts: {},
    // Stores accounts currently being fetched
    // so as to avoid multiple calls to fetch the same
    // resource
    accountsInTransit: {},
  },
  // Messages the user can see on the UI
  //
  // Dismissed messages show be deleted from the list
  messages: [],
}

const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_WEB3: {
      return {
        ...state,
        web3: action.web3js,
        contract: action.contract,
      }
    }
    case REQUEST_PUBLIC_ACCOUNT: {
      const addr = action.data
      return {
        ...state,
        public: {
          ...state.public,
          accountsInTransit: Object.assign({}, state.public.accountsInTransit, { [addr]: true }),
        },
      }
    }
    case SET_PUBLIC_ACCOUNT: {
      // action.data contains 'addr', 'name', 'dateCreated'
      // at the time of writing
      const { addr } = action.data
      // Remove the public account from accountsInTransit
      const { accountsInTransit } = state.public
      delete accountsInTransit[addr]
      return {
        ...state,
        public: {
          ...state.public,
          accounts: Object.assign({}, state.public.accounts, { [addr]: action.data }),
          accountsInTransit: Object.assign({}, accountsInTransit),
        },
      }
    }
    case ADD_MESSAGE: {
      return {
        ...state,
        messages: [...state.messages.slice(0), action.data],
      }
    }
    case REMOVE_MESSAGE: {
      // Expects action.data to be the key of the message to be removed.
      // state.messages is a list of message objects each having a property @key
      // which allows us to uniquely identify it, and thus remove it.
      const transactionHash = action.data
      const { messages } = state
      const idx = messages.findIndex(msg => msg.key === transactionHash)
      return {
        ...state,
        messages: Array.prototype.concat(messages.slice(0, idx), messages.slice(idx + 1)),
      }
    }
    case SET_ETH_EVENTS: {
      return {
        ...state,
        ethEvents: action.events,
      }
    }
    case SET_ETH_ACCOUNTS: {
      return {
        ...state,
        accounts: action.accounts,
      }
    }
    case SET_SEARCH_OPTIONS: {
      return {
        ...state,
        searchOptions: {
          ...state.searchOptions,
          ...action.data,
        },
      }
    }
    case REQUEST_LISTINGS: {
      return Object.assign({}, state, {
        isFetching: true,
        // didInvalidate: false,
      })
    }
    case SET_ACCOUNT: {
      return {
        ...state,
        account: {
          ...action.data,
        },
      }
    }
    case RECEIVE_ACCOUNT_INFO: {
      const isSetLocal = isSet(action.data) && Object.entries(action.data).length !== 0
      let accountInfo = isSetLocal ? action.data : null
      if (isSetLocal) {
        // Convert dates to date objects
        const bookings = (hasKey(accountInfo, 'bookings') && isSet(accountInfo.bookings))
          ? accountInfo.bookings.map(b => ({
            ...b,
            fromDate: new Date(Date.parse(b.fromDate)),
            toDate: new Date(Date.parse(b.toDate)),
          })) : []
        accountInfo = {
          ...action.data,
          bookings,
        }
      }
      return {
        ...state,
        accountInfo,
      }
    }
    case RECEIVE_LISTINGS:
      return Object.assign({}, state, {
        isFetching: false,
        listings: action.listings,
        lastUpdated: action.receivedAt,
        // didInvalidate: false,
      })
    case ADD_PENDING_TX: {
      // Add the tx to pendingTx in state
      // and in localStorage
      const { storageKey } = action.data
      const storageVal = JSON.stringify(action.data)
      localStorage.setItem(storageKey, storageVal)
      return {
        ...state,
        pendingTx: Object.assign({}, state.pendingTx, { [storageKey]: storageVal }),
      }
    }
    case REMOVE_PENDING_TX: {
      // FIXME:
      // Remove the pendingTx from state
      // and from localStorage
      const copyPendingTx = Object.assign({}, state.pendingTx)
      // TODO: undo this
      // const { storageKey } = action.data
      // delete copyPendingTx[storageKey]
      return {
        ...state,
        pendingTx: copyPendingTx,
      }
    }
    default: {
      return state
    }
  }
}

export default rootReducer
