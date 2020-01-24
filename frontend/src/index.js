import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import 'semantic-ui-css/semantic.min.css'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faStar } from '@fortawesome/free-solid-svg-icons'
import './css/bootstrap-4.1.0.min.css'
import './main.css'
import App from './components/App'
import * as serviceWorker from './serviceWorker'
import configureStore from './redux/store'
import './loadAbi'

const store = configureStore()


render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root'),
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister()


// Add FontAwesome library to make it accessible in the project
library.add(faStar)
