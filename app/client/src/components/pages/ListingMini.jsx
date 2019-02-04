import React, { Component } from 'react'
import Img from 'react-image'
import IPFSImage from '../IPFSImage'

class ListingMini extends Component {
  render() {
    const { title, price, location, country } = this.props
    return (
      <div className="listing-mini">
        <Img width="100px" src="http://localhost:3000/house-fallback.png" />
        <h5> {title} </h5> 
        <div> <em> Location: </em> <span class="location"> {location} </span> </div>
        <div> <em> Country: </em> <span class="country"> {country} </span> </div>
        <div> <em> Price: </em> <span class="price"> {price} </span> </div> 
        {/* <IPFSImage hash={l.mainImageHash} ext={l.mainImageExtension} /> */}
      </div>
    )
  }
}

export default ListingMini
