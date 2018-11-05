import {
    REFRESH_ETH, SELECT_CLIENT, CREATE_ACCOUNT, CREATE_LISTING, ADD_MESSAGE
} from "../constants/action-types.js"

export const refreshEth = (eth) => ({type: REFRESH_ETH, payload: eth})
export const selectClient = (index) => ({type: SELECT_CLIENT, payload : index})
export const addMessage = (message) => ({type: ADD_MESSAGE, payload: message})

// Client actions
// The payload must be a dictionary with properties: name and value
// where 'name' determines which client property to be updated value in the client to be updated in response to the action,
// and where 'value' determines the new value that the peroperty should be updated to.
export const createAccount = (account) => ({type: CREATE_ACCOUNT, payload: {name: 'account', value: account}})
export const createListing = (listing) => ({type: CREATE_LISTING, payload: {name: 'listing', value: listing}})
