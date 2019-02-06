import React, { Component } from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import EthManager from './EthManager'
import ListingView from './pages/ListingView'
import ServerNodeManager from './ServerNodeManager'
import log from '../logger'
import AdminPage from './pages/AdminPage'
import ListingSearch from './pages/ListingSearch'
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
          <Route exact path="/listing" component={ListingSearch} />
          <Route path="/listing/:lid" component={ListingView} />
          <Route exact path="/admin" component={AdminPage} />
        </div>
      </Router>
    )
  }
}

export default App
