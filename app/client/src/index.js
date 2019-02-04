import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import 'semantic-ui-css/semantic.min.css';
import store from './store/index'
import App from './components/App'
import * as serviceWorker from './serviceWorker'
import log from './logger'

log.debug('Starting app')
render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister()
