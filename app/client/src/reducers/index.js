import log from '../logger'
import {
  REFRESH_ETH, SELECT_CLIENT, CREATE_ACCOUNT, CREATE_LISTING, ADD_MESSAGE, GET_ALL_LISTINGS, SET_LISTING_RESULTS,
} from '../constants/action-types'
import { MAX_CLIENTS, NONE_ADDRESS } from '../constants/global'

const initialState = {
  MAX_CLIENTS,
  selectedClientAddr: NONE_ADDRESS,
  messages: [],
  clients: {},
  server: { listings: {} },
  // The result from Listing searches
  listingResults: {},
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
      log.debug('CREATE_ACCOUNT', action.payload.value.from)
      const clients = updateClientWithAddr(state.clients, action.payload.value.from, action)
      return {
        ...state,
        clients,
      }
    }
    case SET_LISTING_RESULTS: {
      console.log('In SET_LISTING_RESULTS reducer')
      return {
        ...state,
        listingResults: action.payload,
      }
    }
    case CREATE_LISTING: {
      log.debug('CREATE_LISTING', action.payload)
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
    case GET_ALL_LISTINGS: {
      log.debug('GET_ALL_LISTINGS', action.payload)
      const serverObj = { ...state.server }
      serverObj.listings = { ...action.payload }
      return {
        ...state,
        server: serverObj,
      }
    }
    default: {
      log.debug('default')
      return state
    }
  }
}

export default rootReducer
