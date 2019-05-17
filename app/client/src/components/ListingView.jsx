import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Button, Loader } from 'semantic-ui-react'
import { contractCall } from '../redux/actions'
import { fetchListingsIfNeeded } from '../redux/listingActions'
import { isSet, formatDate, hasKey, capitaliseWord } from '../constants/global'
import IPFSImage from './IPFSImage'
import '../css/listing-view.css'
import EthDatePicker from './EthDatePicker'


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
      },
    }
    // Storage key used for 'book' contractCall
    this.getStorageKey = (lid, fromDate1, nbOfDays, userAddr) => `${userAddr} rate(${lid}, ${formatDate(fromDate1)}, ${nbOfDays})`
  }

  componentDidMount() {
    const { dispatch } = this.props
    dispatch(fetchListingsIfNeeded())
  }

  onDateChange(data) {
    const [fromDate, toDate] = data
    // Also think about what happens if the user deselects the dates they had already picked
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

  getListingField(listing, field) {
    const { verified } = this.state
    const getVerified = () => {
      if (isSet(verified[field])) {
        return verified[field] ? '✅' : '❌'
      }
      return ''
    }
    const label = capitaliseWord(field)
    return (
      <div key={field}>
        <em> {label}: </em>
        <span className={field}>
          { listing[field] }
          { getVerified() }
        </span>
      </div>
    )
  }

  getListingDetails(lid) {
    const { listings, isFetching } = this.props
    const { fromDate, toDate } = this.state
    let hash
    let ext
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
    if (Array.isArray(listing.images) && listing.images.length > 0) {
      const img = listing.images[0]
      if (img && hasKey(img, 'hash') && hasKey(img, 'path')) {
        hash = img.hash
        ext = img.path.split('.').pop()
      }
    }
    const fields = ['description', 'location', 'country', 'price']
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
    const { contract, accounts, selectedAccountIndex } = this.props
    const userAddr = accounts[selectedAccountIndex]
    const listing = this.getListing()
    const { lid } = listing
    const { verified } = this.state
    const obj = {
      gas: 1000000,
      from: userAddr,
    }
    try {
      const res = await contract.methods.getListingAll(lid).call(obj)
      Object.keys(verified).forEach((field) => {
        // We don't care to check for types here
        // so we just '==' instead of '==='
        // eslint-disable-next-line eqeqeq
        verified[field] = res[field] == listing[field]
      })
      this.setState({ verified })
    } catch (err) {
      console.log('Failed to call getListingAll()')
      // TODO: Display UI alert error
    }
  }

  // Returns true if the 'Book listing' button should be active
  isDisabled() {
    const { fromDate, toDate } = this.props
    return !isSet(fromDate) || !isSet(toDate)
  }

  render() {
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
        <Button attached="top" onClick={this.verifyAgainstChain}> Verify </Button>
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
  listings: PropTypes.array,
}

const mapStateToProps = (state, ownProps) => ({
  accounts: state.accounts,
  contract: state.contract,
  listings: state.listings,
  isFetching: state.isFetching,
  lid: ownProps.lid,
  fromDate: state.searchOptions.fromDate,
  toDate: state.searchOptions.toDate,
  selectedAccountIndex: state.selectedAccountIndex,
})

export default connect(mapStateToProps)(ListingView)
