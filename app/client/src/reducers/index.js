import { REFRESH_ETH, SELECT_CLIENT, CREATE_ACCOUNT } from "../constants/action-types.js"

const initialState = {
  selectedClient: 0,
  clients: [],
  MAX_CLIENTS: 3
}

const getClients = (eth, state) => {
    console.log("getClients", state)
  // Create the clients and add watchers for each
  let clients = []
  for (var i = 0; i < state.MAX_CLIENTS; i++) {
    clients.push({
      "address": eth.accounts[i],
      "account": null,
      "listings": null
    })
  }
  console.log("finished with getClients", clients)
  return clients
}

const rootReducer = (state = initialState, action) => {
  console.log("rootReducer", action.type, state)
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
      console.log("the select client payload is ", action.payload, typeof(action.payload))
      return {...state, selectedClient: action.payload}
    }
    case CREATE_ACCOUNT: {
      return state
    }
    default: {
      console.log("default")
      return state
    }
  }
}

export default rootReducer
