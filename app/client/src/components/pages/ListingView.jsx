import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Button, Loader } from 'semantic-ui-react'
import { fetchListingsIfNeeded, contractCall } from '../../redux/actions'
import { isSet, formatDate } from '../../constants/global'
import IPFSImage from '../IPFSImage'
import '../../css/listing-view.css'
import EthDatePicker from './EthDatePicker'


class ListingView extends Component {
  constructor() {
    super()
    this.onBookButtonClicked = this.onBookButtonClicked.bind(this)
    // Storage key used for 'book' contractCall
    this.getStorageKey = (lid, fromDate, nbOfDays, userAddr) => `${userAddr} rate(${lid}, ${formatDate(fromDate)}, ${nbOfDays})`
  }

  componentDidMount() {
    const { dispatch } = this.props
    dispatch(fetchListingsIfNeeded())
  }

  onBookButtonClicked() {
    const { dispatch, accounts, selectedAccountIndex, match } = this.props
    const userAddr = accounts[selectedAccountIndex]
    const lid = parseInt(match.params.lid, 10)
    const [fromDate, nbOfDays] = this.getFromDateAndNbOfDays()
    const other = {
      eventName: 'BookingComplete',
      storageKey: this.getStorageKey(lid, fromDate, nbOfDays, userAddr),
      returnVal: true,
    }
    dispatch(contractCall('listingBook', [lid, fromDate, nbOfDays], userAddr, other))
  }

  // Returns [fromDate, nbOfDays] if 'fromDate' and 'toDate' props
  // were set, otherwise an empty array is returned
  getFromDateAndNbOfDays() {
    const { toDate } = this.props
    let { fromDate } = this.props
    if (!fromDate || !toDate) {
      return []
    }
    const nbOfDays = (toDate - fromDate) / (86400000) // number of milliseconds per day
    fromDate = fromDate.getTime() / 1000
    return [fromDate, nbOfDays]
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
        <Button toggle active disabled={this.isDisabled()} onClick={this.onBookButtonClicked}>
          Book listing
        </Button>
      </div>
    )
  }

  // Returns true if the 'Book listing' button should be active
  isDisabled() {
    const { fromDate, toDate } = this.props
    return !isSet(fromDate) || !isSet(toDate)
  }

  render() {
    const { listings, match, isFetching } = this.props
    const lid = parseInt(match.params.lid, 10)
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

ListingView.defaultTypes = {
  fromDate: null,
  toDate: null,
}

ListingView.propTypes = {
  isFetching: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
  fromDate: PropTypes.object,
  toDate: PropTypes.object,
}

const mapStateToProps = (state, ownProps) => ({
  accounts: Object.keys(state.accounts),
  contract: state.contract,
  listings: state.listings,
  isFetching: state.isFetching,
  lid: ownProps.lid,
  fromDate: state.searchOptions.fromDate,
  toDate: state.searchOptions.toDate,
  selectedAccountIndex: state.selectedAccountIndex,
})

export default connect(mapStateToProps)(ListingView)
