import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import SemanticDatepicker from 'react-semantic-ui-datepickers'
import { setSearchOptions } from '../../redux/actions'
import 'react-semantic-ui-datepickers/dist/react-semantic-ui-datepickers.css'
import '../../css/eth-datepicker.css'


class ListingSearchArea extends Component {
  constructor() {
    super()
    this.onDateChange = this.onDateChange.bind(this)
  }

  onDateChange(data) {
    const { dispatch } = this.props
    if (data.length === 2) {
      dispatch(setSearchOptions({
        fromDate: data[0],
        toDate: data[1],
      }))
    }
  }

  render() {
    const { fromDate, toDate } = this.props
    return (
      <div className="datepicker-wrapper">
        <SemanticDatepicker
          onDateChange={this.onDateChange}
          type="range"
          selected={(!fromDate || !toDate) ? [] : [fromDate, toDate]}
        />
      </div>
    )
  }
}

const mapStateToProps = state => ({
  fromDate: state.searchOptions.fromDate,
  toDate: state.searchOptions.toDate,
})

ListingSearchArea.defaultProps = {
  fromDate: null,
  toDate: null,
}

ListingSearchArea.propTypes = {
  dispatch: PropTypes.func.isRequired,
  fromDate: PropTypes.instanceOf(Date),
  toDate: PropTypes.instanceOf(Date),
}

export default connect(mapStateToProps)(ListingSearchArea)
