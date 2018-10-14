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
      return {...state, selectedClient: action.payload}
    }
    case CREATE_ACCOUNT: {
      console.log("CREATE_ACCOUNT")
      return state
    }
    default: {
      console.log("default")
      return state
    }
  }
}

export default rootReducer
