import {
  SERVER_NODE_URL,
  SERVER_PUBLIC_URL,
  isSet,
  hasKey,
} from '../constants/global'

// ============================================================
// EXPORT ACTIONS
// ============================================================

export const LOAD_PENDING_TX_FROM_LOCAL_STORAGE = 'LOAD_PENDING_TX_FROM_LOCAL_STORAGE'
export const ADD_PENDING_TX = 'ADD_PENDING_TX'
export const REMOVE_PENDING_TX = 'REMOVE_PENDING_TX'
export const SET_SEARCH_OPTIONS = 'SET_SEARCH_OPTIONS'
export const REQUEST_PUBLIC_ACCOUNT = 'REQUEST_PUBLIC_ACCOUNT'

export const RECEIVE_ACCOUNT_INFO = 'RECEIVE_ACCOUNT_INFO'
export const ADD_MESSAGE = 'ADD_MESSAGE'
export const REMOVE_MESSAGE = 'REMOVE_MESSAGE'
export const SET_WEB3 = 'SET_WEB3'
export const SET_ACCOUNTS = 'SET_ACCOUNTS'
export const SET_PUBLIC_ACCOUNT = 'SET_PUBLIC_ACCCOUNT'
export const SET_SELECTED_ACCOUNT = 'SET_SELECTED_ACCOUNT'
export const SET_ETH_EVENTS = 'SET_ETH_EVENTS'
export const RATE_BOOKING = 'RATE_BOOKING'


const removePendingTx = (funcName, input, userAddr, other) => {
  return (dispatch) => {
    const data = {
      funcName,
      input,
      userAddr,
      ...other,
    }
    setTimeout(() => {
      dispatch({
        type: REMOVE_PENDING_TX,
        data,
      })
    }, 5000)

    // TODO: unregister from event
  }
}

const addPendingTx = (funcName, input, userAddr, other) => {
  return (dispatch, getState) => {
    // Register an event if the eventName field is set.
    const { eventName } = other
    if (eventName) {
      const options = {}
      const { contract } = getState()
      const data = {
        funcName,
        input,
        userAddr,
        ...other,
      }
      contract.events[eventName](options, (err, event) => {
        console.log(err)
        console.log(event)
        if (!err) {
          // On event fire, remove the event from pendingTx
          console.log(`${eventName} fired. Removing from pendingTx`, event)
          dispatch(removePendingTx(funcName, input, userAddr, other))
        }
      })
      dispatch({
        type: ADD_PENDING_TX,
        data,
      })
    }
  }
}

const shouldFetchEthEvents = (state, accountAddr) => {
  const { ethEvents, isFetchingEthEvents } = state
  if (!Array.isArray(ethEvents[accountAddr])) {
    return true
  }
  return !isFetchingEthEvents
}


// Fetches the requested public account if it is not already
// being fetched
export const fetchPublicAccount = (addr) => {
  return (dispatch, getState) => {
    if (isSet(addr)) {
      const url = `${SERVER_PUBLIC_URL}accounts/${addr}`
      const { accountsInTransit, accounts } = getState().public
      if (!hasKey(accountsInTransit, addr) && !hasKey(accounts, addr)) {
        dispatch({ type: REQUEST_PUBLIC_ACCOUNT, data: addr })
        fetch(url)
          .then(response => response.json())
          .then(json => dispatch({
            type: SET_PUBLIC_ACCOUNT,
            data: json,
          }))
          .catch(err => console.log('some error occurred', err))
      }
    }
  }
}

// Wrapper function for all state-changing calls
//
// @funcName     the name of the state-changing function
// @input        input values to state-changing function
// @userAddr     address for the account sending the TX
// @other        anything else that needs to be stored in the txObj
//               e.g. txHash, eventName
export const contractCall = (funcName, input, userAddr, other) => {
  return (dispatch, getState) => {
    const { contract } = getState()
    const obj = {
      from: userAddr,
      gas: 1000000,
    }
    // Async
    dispatch(addPendingTx(funcName, input, userAddr, other))
    return contract.methods[funcName](...input).send(obj)
      .then((tx) => {
        console.log(`Transaction '${funcName}' sent: `, tx)
        const { transactionHash } = tx
        const header = 'Transaction sent'
        const text = `Transaction (${transactionHash.substr(0, 5)}) for function '${funcName}' sent.`
        // TODO: would be good to have a class message
        //       and/or use typescript
        // Create a message object indexable through the transaction hash
        const message = {
          header,
          key: transactionHash,
          text,
          type: 'info',
          data: Object.assign({}, tx),
        }
        dispatch({ type: ADD_MESSAGE, data: message })
        return Promise.resolve(tx)
      })
      .catch((err) => {
        console.log(`Transaction '${funcName}' send error ${err}`)
        return Promise.all([
          dispatch({ type: REMOVE_PENDING_TX }),
          dispatch(removePendingTx(funcName, input, userAddr, other)),
        ])
      })
  }
}

export const setSelectedAcccountIndex = (idx) => {
  return {
    type: SET_SELECTED_ACCOUNT,
    selectedAccountIndex: idx,
  }
}

export const setWeb3Js = (web3js) => {
  return (dispatch) => {
    const { jsonInterface, contractAddress } = window.contractDetails
    // We must set the provider before instantiating the contract
    // so that the provider is passed to the contract instance
    const provider = new web3js.providers.WebsocketProvider('ws://localhost:8545')
    web3js.setProvider(provider)
    const contract = new web3js.eth.Contract(jsonInterface.abi, contractAddress)
    web3js.eth.getAccounts()
      .then((accounts) => {
        dispatch({
          type: SET_WEB3,
          web3js,
          contract,
          accounts,
        })
        dispatch({
          type: SET_ACCOUNTS,
          accounts,
        })
        dispatch({
          type: SET_SELECTED_ACCOUNT,
          selectedAccountIndex: 0,
        })
      })
  }
}

export const fetchAccountInfo = (user) => {
  const url = `${SERVER_NODE_URL}api/account/${user}`
  return (dispatch) => {
    fetch(url)
      .then(response => response.json())
      .then(json => dispatch({
        type: RECEIVE_ACCOUNT_INFO,
        data: json,
      }))
  }
}

export const fetchEthEvents = (contract, accountAddr) => {
  return (dispatch) => {
    const opts = {
      fromBlock: 0,
      toBlock: 'latest',
    }
    contract.getPastEvents('allEvents', opts)
      .then((events) => {
        dispatch({
          type: SET_ETH_EVENTS,
          accountAddr,
          events,
        })
      })
      .catch((err) => {
        console.log('We hit an error fetching Past events', err)
      })
  }
}

export const fetchEthEventsIfNeeded = (accountAddr) => {
  return (dispatch, getState) => {
    const state = getState()
    const { contract } = state
    if (shouldFetchEthEvents(state, accountAddr)) {
      return dispatch(fetchEthEvents(contract, accountAddr))
    }
  }
}
