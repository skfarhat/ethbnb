import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import { createLogger } from 'redux-logger'
import promiseMiddleware from 'redux-promise'
import rootReducer from './reducers'

const loggerMiddleware = createLogger()

const configureStore = (preloadedState) => {
  return createStore(
    rootReducer,
    preloadedState,
    applyMiddleware(thunkMiddleware, promiseMiddleware, loggerMiddleware),
  )
}

export default configureStore
