import log from "../logger"
import { REFRESH_ETH, SELECT_CLIENT, CREATE_ACCOUNT, CREATE_LISTING, ADD_MESSAGE } from "../constants/action-types.js"

const initialState = {
  MAX_CLIENTS: 3,
  selectedClientAddr: '0x0',
  messages: [],
  clients: {},
  eth: {}
}

const getClients = (eth, state) => {
  let clients = []
  for (var i = 0; i < state.MAX_CLIENTS; i++) {
    clients[eth.accounts[i]] = {
      "address": eth.accounts[i],
      "account": null,
      "listings": {}
    }
  }
  return clients
}

const updateClientWithAddr = (clients, addr, action) => {
  const clone = {...clients}
  for (var a in clone) {
    if (a === addr) {
      clone[a] = {
        ...clone[a], 
        account: action.payload.value
      }
    }
  }
  return clone
}

const rootReducer = (state = initialState, action) => {
  log.debug("rootReducer", action, state)
  switch (action.type) {
    case REFRESH_ETH: {
      const eth = action.payload
      return {
        ...state,
        eth: action.payload,
        clients: getClients(eth, state)
      };
    }
    case SELECT_CLIENT: {
      return {
        ...state,
        selectedClientAddr: action.payload
      }
    }
    case CREATE_ACCOUNT: {
      log.debug("CREATE_ACCOUNT", action.payload.value.from)
      const clients = updateClientWithAddr(state.clients, action.payload.value.from, action)
      return {
        ...state,
        clients: clients
      }
    }
    case CREATE_LISTING: {
      log.debug("CREATE_LISTING", action.payload)
      const listing = action.payload.value
      let clone = {...state.clients}
      for (var addr in clone) {
        const client = clone[addr]
        if (client.address === action.payload.value.from){
          console.log("found one that matches")
          client.listings[listing.id] = listing
        }
      }
      return {
        ...state,
        clients: clone
      }
    }
    case ADD_MESSAGE: {
      log.debug('ADD_MESSAGE', action.payload)
      return {
        ...state,
        messages: state.messages.concat(action.payload)
      }
    }
    default: {
      log.debug("default")
      return state
    }
  }
}

export default rootReducer
