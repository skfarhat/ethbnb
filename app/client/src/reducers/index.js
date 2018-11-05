import log from "../logger"
import { REFRESH_ETH, SELECT_CLIENT, CREATE_ACCOUNT, CREATE_LISTING, ADD_MESSAGE } from "../constants/action-types.js"

const initialState = {
  MAX_CLIENTS: 3,
  selectedClient: 0,
  messages: [],
  clients: [],
  eth: {}
}

const getClients = (eth, state) => {
  let clients = []
  for (var i = 0; i < state.MAX_CLIENTS; i++) {
    clients.push({
      "address": eth.accounts[i],
      "account": null,
      "listings": {}
    })
  }
  return clients
}

const updateClientWithAddr = (clients, addr, action) => {
  return clients.map((client, index) => {
    if (client.address === addr) {
      return {
        ...client,
        account: action.payload.value
      }
    } else {
      return client
    }
  })
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
        selectedClient: action.payload
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
      let clients = state.clients.map((client, index) => {
        if (client.address === action.payload.value.from) {
          return {
            ...client,
            listings: {...client.listings, [listing.id]: listing}
          }
        } else {
          return client
        }
      })
      return {...state, clients: clients}
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
