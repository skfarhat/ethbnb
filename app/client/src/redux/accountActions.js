import {
  SERVER_NODE_URL,
  SERVER_PUBLIC_URL,
  isSet,
  hasKey,
} from '../constants/global'

const SET_ETH_ACCOUNTS = 'SET_ETH_ACCOUNTS'
const REQUEST_PUBLIC_ACCOUNT = 'REQUEST_PUBLIC_ACCOUNT'
const RECEIVE_ACCOUNT_INFO = 'RECEIVE_ACCOUNT_INFO'
const SET_PUBLIC_ACCOUNT = 'SET_PUBLIC_ACCCOUNT'
const SET_ACCOUNT = 'SET_ACCOUNT'


// Fetches the requested public account if it is not already
// being fetched
const fetchPublicAccount = (addr) => {
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

const fetchAccountInfo = (addr) => {
  const url = `${SERVER_NODE_URL}api/account/${addr}`
  return (dispatch) => {
    fetch(url)
      .then(response => response.json())
      .then(json => dispatch({
        type: RECEIVE_ACCOUNT_INFO,
        data: json,
      }))
  }
}

//
const setAccount = (addr) => {
  return (dispatch, getState) => {
    const { accounts } = getState()
    if (!isSet(accounts) || accounts.length === 0) {
      // No account available to select, we set it to null
      dispatch({
        type: SET_ACCOUNT,
        data: null,
      })
    } else if (!isSet(addr)) {
      // If no address is provided, we pick the default,
      // in this case, the first eth address from accounts
      addr = accounts[0]
    }

    // Set the state.account object
    dispatch({
      type: SET_ACCOUNT,
      data: {
        addr,
        balance: 0,
      },
    })
    // Fetch accountInfo data from the backend
    // and set state.accountInfo
    dispatch(fetchAccountInfo(addr))
  }
}

// Getter function for current account's address
const getAddr = (state) => {
  const { account } = state
  if (isSet(account)) {
    return account.addr
  }
  return null
}

export {
  SET_ACCOUNT,
  SET_ETH_ACCOUNTS,
  REQUEST_PUBLIC_ACCOUNT,
  RECEIVE_ACCOUNT_INFO,
  SET_PUBLIC_ACCOUNT,

  // Action functions
  getAddr,
  setAccount,
  fetchAccountInfo,
  fetchPublicAccount,
}
