import React, { Component } from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import ListingView from './pages/ListingView'
import AdminPage from './admin/AdminPage'
import ListingSearch from './pages/ListingSearch'
import Navigation from './pages/Navigation'
import '../css/bootstrap-4.1.0.min.css'
import 'react-table/react-table.css'
import '../main.css'


class App extends Component {
  render() {
    return (
      <Router>
        <div className="container">
          <Navigation />
          <Route exact path="/admin" component={AdminPage} />
          <Route exact path="/listing" component={ListingSearch} />
          <Route path="/listing/:lid" component={ListingView} />
        </div>
      </Router>
    )
  }
}

export default App
