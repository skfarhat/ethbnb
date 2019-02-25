import {
  REFRESH_ETH,
  REQUEST_LISTINGS, RECEIVE_LISTINGS,
} from '../actions'
import { MAX_CLIENTS, NONE_ADDRESS } from '../constants/global'

const initialState = {
  MAX_CLIENTS,
  selectedClientAddr: NONE_ADDRESS,
  messages: [],
  clients: {},
  isFetching: false,
  listings: null,
  eth: {},
}

const getClients = (eth, state) => {
  const clients = []
  for (let i = 0; i < state.MAX_CLIENTS; i += 1) {
    clients[eth.accounts[i]] = {
      address: eth.accounts[i],
      account: null,
      listings: {},
    }
  }
  return clients
}

const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case REFRESH_ETH: {
      const eth = action.payload
      return {
        ...state,
        eth: action.payload,
        clients: getClients(eth, state),
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
    default: {
      return state
    }
  }
}

export default rootReducer
