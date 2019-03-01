import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import PropTypes from 'prop-types'
import { Dropdown } from 'semantic-ui-react'
import { setSelectedAcccountIndex } from '../../redux/actions'


const isSet = val => val !== null && typeof (val) !== 'undefined'

const options = [
  {
    key: 'profile',
    value: -1,
    text: 'Your Profile',
    disabled: true,
  },
]

const getOptions = (accounts) => {
  if (!isSet(accounts) || accounts.length === 0) {
    return options
  }
  // Enable the
  options[0].disabled = false
  return options.concat(
    accounts.map((adr, idx) => ({ key: adr, value: idx, text: adr.substr(0, 5) })),
  )
}

class AccountDropdown extends Component {
  constructor() {
    super()
    this.onAccountMenuChange = this.onAccountMenuChange.bind(this)
    this.options = options
  }

  onAccountMenuChange(ev, data) {
    console.log('onAccountMenuChange')
    const { dispatch, history } = this.props
    if (data.value === -1) {
      history.push('/account')
    } else {
      dispatch(setSelectedAcccountIndex(data.value))
    }
  }

  render() {
    const { accounts, selectedAccountIndex } = this.props
    this.options = getOptions(accounts)
    return (
      <Dropdown
        // selection
        onChange={this.onAccountMenuChange}
        value={selectedAccountIndex}
        options={this.options}
        noResultsMessage="No accounts."
      />
    )
  }
}

AccountDropdown.defaultProps = {
  selectedAccountIndex: 0,
}

AccountDropdown.propTypes = {
  dispatch: PropTypes.func.isRequired,
  selectedAccountIndex: PropTypes.number,
  history: PropTypes.object.isRequired,
}


const mapStateToProps = state => ({
  accounts: state.accounts,
  selectedAccountIndex: state.selectedAccountIndex,
})

export default connect(mapStateToProps)(withRouter(AccountDropdown))
