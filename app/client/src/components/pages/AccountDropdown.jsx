import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { Dropdown, Icon } from 'semantic-ui-react'
import { setSelectedAcccountIndex } from '../../redux/actions'

const isSet = val => val !== null && typeof (val) !== 'undefined'

const options = [
  // {
  //   key: 'user',
  //   text: (
  //     <span>
  //       Signed in as
  //       <strong>Bob Smith</strong>
  //     </span>
  //   ),
  //   disabled: true,
  // },
  {
    key: 'profile',
    value: -1,
    text: (
      <Link to="/account">
        <span> Your Profile </span>
      </Link>
    ),
  },
]

const getOptions = (accounts) => {
  if (!isSet(accounts)) {
    return options
  }
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
    const { dispatch } = this.props
    if (data.value === -1) {
      // TODO: Switch to account page
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
}


const mapStateToProps = state => ({
  placeholder: "Select Country",
  accounts: state.accounts,
  selectedAccountIndex: state.selectedAccountIndex,
})

export default connect(mapStateToProps)(AccountDropdown)
