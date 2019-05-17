import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Dropdown } from 'semantic-ui-react'
import { isSet } from '../constants/global'
import { setSelectedAcccountIndex } from '../redux/actions'


class AccountDropdown extends Component {
  render() {
    const { accounts, dispatch, selectedAccountIndex } = this.props
    const options = (isSet(accounts))
      ? accounts.map((addr, idx) => ({ key: addr, value: idx, text: addr.substr(0, 5) }))
      : []
    return (
      <Dropdown
        noResultsMessage="No accounts."
        value={selectedAccountIndex}
        options={options}
        loading={options.length === 0}
        onChange={(data, { value }) => dispatch(setSelectedAcccountIndex(value))}
      />
    )
  }
}

AccountDropdown.defaultProps = {
  accunts: null,
  selectedAccountIndex: 0,
}

AccountDropdown.propTypes = {
  accounts: PropTypes.array,
  dispatch: PropTypes.func.isRequired,
  selectedAccountIndex: PropTypes.number,
}


const mapStateToProps = state => ({
  accounts: state.accounts,
  selectedAccountIndex: state.selectedAccountIndex,
})

export default connect(mapStateToProps)(AccountDropdown)
