import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Button, Loader } from 'semantic-ui-react'
import { fetchListingsIfNeeded, bookListing } from '../../redux/actions'
import IPFSImage from '../IPFSImage'
import '../../css/listing-view.css'
import EthDatePicker from './EthDatePicker'

const formatDate = (date) => {
  if (date === null || typeof (date) === 'undefined') {
    return ''
  }
  const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }
  return date.toLocaleDateString('en-UK', options)
}

class ListingView extends Component {
  constructor() {
    super()
    this.onBookButtonClicked = this.onBookButtonClicked.bind(this)
  }

  componentDidMount() {
    const { dispatch } = this.props
    dispatch(fetchListingsIfNeeded())
  }

  onBookButtonClicked() {
    const { dispatch, contract, fromDate, toDate, addr, match } = this.props
    const { lid } = match.params
    dispatch(bookListing(contract, addr, lid, fromDate, toDate))
  }

  getListingDetails(isFetching, listings, lid) {
    const { fromDate, toDate } = this.props
    let hash
    let ext
    // If listings is undefined
    if (listings === null || typeof listings === 'undefined') {
      return (
        <Loader active={isFetching} />)
    }
    // If listings is defined, find the listing with matching lid
    // if zero or more than one are found, return error
    const res = listings.filter(o => o.lid === lid)
    if (res.length !== 1) {
      return (
        <h4>
          {`Error looking for listing with lid ${lid}`}
        </h4>
      )
    }
    const l = res[0]
    if (Array.isArray(l.images) && l.images.length > 0) {
      const img = l.images[0]
      if (img && Object.prototype.hasOwnProperty.call(img, 'hash')
        && Object.prototype.hasOwnProperty.call(img, 'path')) {
        hash = img.hash
        ext = img.path.split('.').pop()
      }
    }

    return (
      <div>
        <div>
          {`${formatDate(fromDate)}\t\t${formatDate(toDate)}`}
        </div>
        <IPFSImage
          hash={hash}
          ext={ext}
        />
        <h5>
          {l.title}
        </h5>
        <div>
          <em> Description: </em>
          <span className="description">
            {l.description}
          </span>
        </div>
        <div>
          <em> Location: </em>
          <span className="location">
            {l.location}
          </span>
        </div>
        <div>
          <em> Country: </em>
          <span className="country">
            {l.country}
          </span>
        </div>
        <div>
          <em> Price: </em>
          <span className="price">
            {l.price}
          </span>
        </div>
        <EthDatePicker />
        <Button toggle active onClick={this.onBookButtonClicked}>
          Book listing
        </Button>
      </div>
    )
  }

  render() {
    const { listings, match, isFetching } = this.props
    const { lid } = match.params
    return (
      <div className="listing-view">
        <Link
          key="back-button"
          to="/listing/"
        >
          <div className="back-button-div">
            <Button attached="top">
              Back
            </Button>
          </div>
        </Link>
        { this.getListingDetails(isFetching, listings, lid) }
      </div>
    )
  }
}

ListingView.propTypes = {
  isFetching: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
  // listings: PropTypes.array.isRequired,
}

const mapStateToProps = (state, ownProps) => ({
  contract: state.contract,
  addr: (state.accounts.length > 0) ? state.accounts[state.selectedAccountIndex] : null,
  listings: state.listings,
  isFetching: state.isFetching,
  lid: ownProps.lid,
  fromDate: state.searchOptions.fromDate,
  toDate: state.searchOptions.toDate,
})

export default connect(mapStateToProps)(ListingView)
