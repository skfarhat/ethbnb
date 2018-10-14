import { REFRESH_ETH, SELECT_CLIENT, CREATE_ACCOUNT } from "../constants/action-types.js"

export const refreshEth = (eth) => ({type: REFRESH_ETH, payload: eth})
export const selectClient = (index) => ({type: SELECT_CLIENT, payload : index})
export const createAccount = (account) => ({type: CREATE_ACCOUNT, payload: account})