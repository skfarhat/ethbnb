import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Button, Loader } from 'semantic-ui-react'
import { contractCall } from '../redux/actions'
import { fetchListingsIfNeeded } from '../redux/listingActions'
import { getAddr } from '../redux/accountActions'
import { isSet, formatDate, capitaliseWord } from '../constants/global'
import IPFSImage from './IPFSImage'
import '../css/listing-view.css'
import EthDatePicker from './EthDatePicker'
import { fromFinney } from './Utils'

class ListingView extends Component {
  constructor(props) {
    super()
    this.onBookButtonClicked = this.onBookButtonClicked.bind(this)
    this.verifyAgainstChain = this.verifyAgainstChain.bind(this)
    this.onDateChange = this.onDateChange.bind(this)
    const { fromDate, toDate } = props
    this.state = {
      fromDate,
      toDate,
      hasVerified: false,
      verified: {
        // Below are the fields which we verify
        // against the actual chain data.
        // They are initialised to undefined meaning
        // we have not checked yet.
        // When 'verifyAgainstChain' is called, we either
        // set them to true or to false and update the UI
        price: undefined,
        owner: undefined,
        location: undefined,
        country: undefined,
        imageCID: undefined,
        imageCIDSource: undefined,
      },
    }
    // Storage key used for 'book' contractCall
    this.getStorageKey = (lid, fromDate1, nbOfDays, userAddr) => `${userAddr} rate(${lid}, ${fromDate1}, ${nbOfDays})`
  }

  componentDidMount() {
    const { dispatch } = this.props
    dispatch(fetchListingsIfNeeded())
  }

  onDateChange(data) {
    if (data === null) {
      this.setState({
        fromDate: null,
        toDate: null,
      })
    } else if (data.length === 2) {
      const [fromDate, toDate] = data
      this.setState({
        fromDate,
        toDate,
      })
    }
  }

  onBookButtonClicked() {
    const { addr, dispatch, match } = this.props
    const lid = parseInt(match.params.lid, 10)
    const [fromDate, nbOfDays] = this.getFromDateAndNbOfDays()
    const other = {
      eventName: 'BookingComplete',
      storageKey: this.getStorageKey(lid, fromDate, nbOfDays, addr),
      returnVal: true,
    }
    console.log('this is the listing', this.getListing())
    // const fromFinney = value => web3.utils.toWei(`${value}`, 'finney')
    const stake = fromFinney(2 * this.getListing().price)
    dispatch(contractCall('bookListing', [lid, fromDate, nbOfDays], addr, stake, other))
  }

  // Returns [fromDate, nbOfDays] if 'fromDate' and 'toDate' props
  // were set, otherwise an empty array is returned
  getFromDateAndNbOfDays() {
    const { toDate } = this.state
    let { fromDate } = this.state
    if (!fromDate || !toDate) {
      return []
    }
    const nbOfDays = (toDate - fromDate) / (86400000) // number of milliseconds per day
    fromDate = fromDate.getTime() / 1000
    return [fromDate, nbOfDays]
  }

  // Returns the listing object associated with this component
  // or null if an error occurred:
  // - no listing with the given id was found
  // - many listings with same id
  getListing() {
    const { listings, match } = this.props
    const lid = parseInt(match.params.lid, 10)
    const filtered = listings.filter(o => o.lid === lid)
    if (filtered.length !== 1) {
      return null
    }
    return filtered[0]
  }

  /**
   * Returns
   *   - positive tickmark if all fields have been verified
   *   - negative tickmark if some have verified negatively
   *   - empty string if some have not been verified
   *
   * @param   fields    Listing fields to be verified
   */
  getVerified(fields) {
    const { verified } = this.state
    const allVerified = fields.map(x => verified[x]).reduce((x,y) => x && y)
    if (isSet(allVerified))
      return allVerified ? ' ✅' : ' ❌'
    else
      return ''
  }

  getListingField(listing, field) {
    const label = capitaliseWord(field)
    return (
      <div key={field}>
        <em> {label}: </em>
        <span className={field}>
          { listing[field] }
          { this.getVerified([field]) }
        </span>
      </div>
    )
  }

  /**
   * Returns IPFSImage JSX for the provided listing.
   * A verified/not-verified sign accompanies the image.
   *
   * NOTE:  only ipfs as a data source is supported and jpg as images are supported
   *
   * @param  listing          Listing object containing imageCID and imageCIDSource
   */
  getListingImage(listing) {
    const { imageCID, imageCIDSource } = listing
    const hash = imageCIDSource === 'ipfs' ? imageCID : ''
    const ext = 'jpg'
    return (
      <div>
        <IPFSImage
          hash={hash}
          ext={ext}
        />
        { this.getVerified(['imageCID', 'imageCIDSource']) }
      </div>
    )
  }

  getListingDetails(lid) {
    const { listings, isFetching } = this.props
    const { fromDate, toDate } = this.state
    // If listings is undefined
    if (!isSet(listings)) {
      return (<Loader active={isFetching} />)
    }
    // Get the listing for this component
    const listing = this.getListing()

    if (!isSet(listing)) {
      return (
        <h4>
          {`Error looking for listing with lid ${lid}`}
        </h4>
      )
    }

    const fields = ['description', 'location', 'country', 'price']
    return (
      <div>
        <div>
          {`${formatDate(fromDate)}\t\t${formatDate(toDate)}`}
        </div>
        { this.getListingImage(listing) }
        <h5>
          {listing.title}
        </h5>
        {
          fields.map(field => this.getListingField(listing, field))
        }
        <EthDatePicker
          onDateChange={this.onDateChange}
          selected={(!fromDate || !toDate) ? [] : [fromDate, toDate]}
        />
        <Button
          toggle
          active
          disabled={this.isDisabled()}
          onClick={this.onBookButtonClicked}
        >
          Book listing
        </Button>
      </div>
    )
  }

  async verifyAgainstChain() {
    const { addr, contract } = this.props
    const { verified } = this.state
    const listing = this.getListing()
    const { lid } = listing
    const obj = {
      gas: 1000000,
      from: addr,
    }
    try {
      const res = await contract.methods.getListingAll(lid).call(obj)
      Object.keys(verified).forEach((field) => {
        // We don't care to check for types here
        // so we just '==' instead of '==='
        // eslint-disable-next-line
        verified[field] = res[field] == listing[field]
      })
      this.setState({ verified })
    } catch (err) {
      console.log('Failed to call getListingAll()')
      // TODO: Display UI alert error
    }
    this.setState({ hasVerified: true })
  }

  // Returns true if the 'Book listing' button should be active
  isDisabled() {
    const { fromDate, toDate } = this.state
    return !isSet(fromDate) || !isSet(toDate)
  }

  render() {
    const { hasVerified } = this.state
    if (!hasVerified) {
      this.verifyAgainstChain()
    }
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
        { this.getListingDetails() }
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
  fromDate: PropTypes.instanceOf(Date),
  toDate: PropTypes.instanceOf(Date),
  listings: PropTypes.array,
}

const mapStateToProps = (state, ownProps) => ({
  addr: getAddr(state),
  contract: state.contract,
  listings: state.listings,
  isFetching: state.isFetching,
  lid: ownProps.lid,
  fromDate: state.searchOptions.fromDate,
  toDate: state.searchOptions.toDate,
})

export default connect(mapStateToProps)(ListingView)
