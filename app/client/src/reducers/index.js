import {
  REFRESH_ETH, SELECT_CLIENT, CREATE_ACCOUNT, CREATE_LISTING, ADD_MESSAGE,
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

const updateClientWithAddr = (clients, addr, action) => {
  const clone = { ...clients }
  for (const a in clone) {
    if (a === addr) {
      clone[a] = {
        ...clone[a],
        account: action.payload.value,
      }
    }
  }
  return clone
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
    case SELECT_CLIENT: {
      return {
        ...state,
        selectedClientAddr: action.payload,
      }
    }
    case CREATE_ACCOUNT: {
      const clients = updateClientWithAddr(state.clients, action.payload.value.from, action)
      return {
        ...state,
        clients,
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
    case CREATE_LISTING: {
      const listing = action.payload.value
      const clone = { ...state.clients }
      for (const addr in clone) {
        const client = clone[addr]
        if (client.address === action.payload.value.from) {
          client.listings[listing.id] = listing
        }
      }
      return {
        ...state,
        clients: clone,
      }
    }
    case ADD_MESSAGE: {
      return {
        ...state,
        messages: state.messages.concat(action.payload),
      }
    }
    default: {
      console.log('default')
      return state
    }
  }
}

export default rootReducer
