import React, { Component } from 'react'
import { BrowserRouter as Router, Route } from "react-router-dom";
import EthManager from "./EthManager"
import log from "../logger"
import AdminPage from './pages/AdminPage'
import ListingsPage from './pages/ListingsPage'
import Navigation from './pages/Navigation'
import "../css/bootstrap-4.1.0.min.css"
import 'react-table/react-table.css'
import '../main.css'

class App extends Component {
  render() {
    log.debug('App: render', this.props, this.state)
    return (
      <Router>
        <div className="container">
          <Navigation />
          <EthManager />
          <Route exact path="/" component={AdminPage} />
          <Route exact path="/listings" component={ListingsPage} />
      </div>
      </Router>
    )
  }
}

export default App
