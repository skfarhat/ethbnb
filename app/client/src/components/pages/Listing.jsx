import React, { Component } from 'react'
import { Link } from 'react-router-dom'

class Listing extends Component { 
  render() {
    const { lid } = this.props.match.params
    return (
      <div className="listing-view"> 
        <div> <Link className="navbar-brand" to="/listing/">Back</Link> </div>
        <h3> {"Listing Page : " + lid} </h3> 
        <p> 
        {JSON.stringify(this.props)}
        </p>
      </div>
      )
  }
}
export default Listing