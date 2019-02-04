import React, { Component } from 'react'
import Img from 'react-image'
import { Link } from 'react-router-dom'
import Listing from './Listing'
import IPFSImage from '../IPFSImage'

class ListingMini extends Component {
  render() {
    const { title, price, location, country } = this.props
    return (
      <div className="listing-mini">
        <Img width="100px" src="http://localhost:3000/house-fallback.png" />
        <Link to="/listing/:lid" component={Listing}> <h5> {title} </h5>  </Link>         
        <div> <em> Location: </em> <span className="location"> {location} </span> </div>
        <div> <em> Country: </em> <span className="country"> {country} </span> </div>
        <div> <em> Price: </em> <span className="price"> {price} </span> </div> 
        {/* <IPFSImage hash={l.mainImageHash} ext={l.mainImageExtension} /> */}
      </div>
    )
  }
}

export default ListingMini
