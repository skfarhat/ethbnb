import log from "../logger"
import { 
  REFRESH_ETH, SELECT_CLIENT, CREATE_ACCOUNT, ADD_MESSAGE
} from "../constants/action-types.js"

const initialState = {
  selectedClient: 0,
  messages: [],
  clients: [],
  MAX_CLIENTS: 3,
  eth: {}
}

const getClients = (eth, state) => {
  let clients = []
  for (var i = 0; i < state.MAX_CLIENTS; i++) {
    clients.push({
      "address": eth.accounts[i],
      "account": null,
      "listings": null
    })
  }
  return clients
}

const updateClientWithAddr = (clients, addr, action) => {
  return clients.map((client, index) => {
    if (client.address === action.payload.from) {
      return {
        ...client, 
        account: action.payload
      }
    }
    else {
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
      return {...state, selectedClient: action.payload}
    }
    case CREATE_ACCOUNT: {
      log.debug("CREATE_ACCOUNT", action.payload.from)
      const clients = updateClientWithAddr(state.clients, action.payload.from, action)
      let x = {...state, clients: clients}
      log.debug('state', x)
      return x
    case ADD_MESSAGE: {
      log.debug('ADD_MESSAGE', action.payload)
      return {...state, messages: state.messages.concat(action.payload)}
    }
    default: {
      log.debug("default")
      return state
    }
  }
}

export default rootReducer
