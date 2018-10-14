import { REFRESH_ETH, SELECT_CLIENT, CREATE_ACCOUNT } from "../constants/action-types.js"

const initialState = {
  selectedClient: 0,
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
  console.log("rootReducer", action, state)
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
      console.log("CREATE_ACCOUNT", action.payload.from)
      const clients = updateClientWithAddr(state.clients, action.payload.from, action)
      let x = {...state, clients: clients}
      console.log('state', x)
      return x
    }
    default: {
      console.log("default")
      return state
    }
  }
}

export default rootReducer
