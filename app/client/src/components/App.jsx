import React, { Component } from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import ListingView from './pages/ListingView'
import ListingSearch from './pages/ListingSearch'
import Navigation from './pages/Navigation'


class App extends Component {
  render() {
    return (
      <Router>
        <div className="container">
          <Navigation />
          <Route exact path="/listing" component={ListingSearch} />
          <Route path="/listing/:lid" component={ListingView} />
        </div>
      </Router>
    )
  }
}

export default App
