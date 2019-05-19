import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Dropdown } from 'semantic-ui-react'
import { isSet } from '../constants/global'
import { setAccount } from '../redux/accountActions'


class AccountDropdown extends Component {
  render() {
    const { accounts, account, dispatch } = this.props
    const options = (isSet(accounts))
      ? accounts.map((addr, idx) => ({ key: addr, value: idx, text: addr.substr(0, 5) }))
      : []
    const selectedIndex = isSet(account) && isSet(accounts) ? accounts.findIndex(v => v === account.addr) : -1
    return (
      <Dropdown
        noResultsMessage="No accounts."
        value={selectedIndex}
        options={options}
        loading={options.length === 0}
        onChange={(data, { value }) => {
          const { key: addr } = options[value]
          dispatch(setAccount(addr))
        }
      }
      />
    )
  }
}

AccountDropdown.defaultProps = {
  accounts: null,
  account: null,
}

AccountDropdown.propTypes = {
  dispatch: PropTypes.func.isRequired,
  accounts: PropTypes.array,
  account: PropTypes.object,
}

const mapStateToProps = state => ({
  accounts: state.accounts,
  account: state.account,
})

export default connect(mapStateToProps)(AccountDropdown)
