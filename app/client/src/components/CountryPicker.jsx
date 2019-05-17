import React, { Component } from 'react'
import { Dropdown } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { countryOptions } from './common'


class CountryPicker extends Component {
  constructor(props) {
    super(props)
    this.countryCodes = countryOptions.map(countryO => ({
      ...countryO,
      value: countryO.code,
    }))
  }

  render() {
    const { onChange } = this.props
    return (
      <div>
        <Dropdown
          className="dropdown-wrapper"
          placeholder="Select Country"
          fluid
          search
          selection
          clearable
          options={this.countryCodes}
          onChange={onChange}
        />
      </div>
    )
  }
}

const mapStateToProps = state => ({
  countryCode: state.searchOptions.countryCode,
})

CountryPicker.defaultProps = {
  countryCode: null,
}

CountryPicker.propTypes = {
  dispatch: PropTypes.func.isRequired,
  countryCode: PropTypes.number,
  onChange: PropTypes.func.isRequired,
}

export default connect(mapStateToProps)(CountryPicker)
