import React, { Component } from 'react'
import Img from 'react-image'
import { Link } from 'react-router-dom'
import Listing from './Listing'
import IPFSImage from '../IPFSImage'

class ListingMini extends Component {
  render() {
    console.log('SHOULDNT BE HERE')
    const { title, price, location, country, images } = this.props
    const { hash, path } = (typeof images !== 'undefined' && images.length > 0) ? images[0] : null
    let fileExt = path.split('.').pop()
    // <Img width="100px" src="http://localhost:3000/house-fallback.png" />
    console.log('ListingMini.jsx')
    console.log(this.props)
    console.log(hash, path)
    return (
      <div className="listing-mini">
        <Link to="/listing/:lid" component={Listing}> <h5> {title} </h5>  </Link>
        <div> <em> Location: </em> <span className="location"> {location} </span> </div>
        <div> <em> Country: </em> <span className="country"> {country} </span> </div>
        <div> <em> Price: </em> <span className="price"> {price} </span> </div>
        <IPFSImage hash={hash} ext={fileExt} />
      </div>
    )
  }
}

export default ListingMini
