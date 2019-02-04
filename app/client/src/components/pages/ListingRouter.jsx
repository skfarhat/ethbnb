import React, { Component } from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import Listing from './Listing'
import ListingSearch from './ListingSearch'

class ListingRouter extends Component {
  render() {
    return (
      <Router>
        <div className="listing-router-container">
          <Route exact path="/listing/" component={ListingSearch} />
          <Route exact path="/listing/:lid" component={Listing} />
        </div>
      </Router>
    )
  }
}
export default ListingRouter
