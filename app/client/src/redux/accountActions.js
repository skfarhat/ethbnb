import {
  SERVER_NODE_URL,
  SERVER_PUBLIC_URL,
  isSet,
  hasKey,
} from '../constants/global'

const SET_ACCOUNTS = 'SET_ACCOUNTS'
const SET_SELECTED_ACCOUNT = 'SET_SELECTED_ACCOUNT'
const REQUEST_PUBLIC_ACCOUNT = 'REQUEST_PUBLIC_ACCOUNT'
const RECEIVE_ACCOUNT_INFO = 'RECEIVE_ACCOUNT_INFO'
const SET_PUBLIC_ACCOUNT = 'SET_PUBLIC_ACCCOUNT'


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

const fetchAccountInfo = (user) => {
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

export {
  SET_ACCOUNTS,
  SET_SELECTED_ACCOUNT,
  REQUEST_PUBLIC_ACCOUNT,
  RECEIVE_ACCOUNT_INFO,
  SET_PUBLIC_ACCOUNT,

  // Action functions
  fetchAccountInfo,
  fetchPublicAccount,
}
