import {
  REQUEST_LISTINGS,
  RECEIVE_LISTINGS,
} from './actions'

const initialState = {
  isFetching: false,
  listings: null,
  eth: {},
}

const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case REQUEST_LISTINGS: {
      return Object.assign({}, state, {
        isFetching: true,
        // didInvalidate: false,
      })
    }
    case RECEIVE_LISTINGS:
      return Object.assign({}, state, {
        isFetching: false,
        listings: action.listings,
        lastUpdated: action.receivedAt,
        // didInvalidate: false,
      })
    default: {
      return state
    }
  }
}

export default rootReducer
