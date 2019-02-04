import React, { Component } from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import EthManager from './EthManager'
import ServerNodeManager from './ServerNodeManager'
import log from '../logger'
import AdminPage from './pages/AdminPage'
import ListingRouter from './pages/ListingRouter'
import Navigation from './pages/Navigation'
import '../css/bootstrap-4.1.0.min.css'
import 'react-table/react-table.css'
import '../main.css'


class App extends Component {
  render() {
    log.debug('App: render', this.props, this.state)
    return (
      <Router>
        <div className="container">
          <Navigation />
          <ServerNodeManager />
          <EthManager />
          <Route exact path="/listing" component={ListingRouter} />
          <Route exact path="/admin" component={AdminPage} />
        </div>
      </Router>
    )
  }
}

export default App
