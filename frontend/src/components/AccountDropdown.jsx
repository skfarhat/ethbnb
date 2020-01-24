import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Dropdown } from 'semantic-ui-react'
import { isSet } from '../constants/global'
import { setAccount } from '../redux/accountActions'


/**
 * React component wrapping around a Dropdown component
 * which allows the selection of an account from the provided list.
 *
 * The component reads the following from state:
 *  @accounts   to get the list of eth accounts available
 *  @account    to figure out which account should be marked
 *              as selected by default
 *
 */
const AccountDropdown = (props) => {
  const { accounts, account, dispatch } = props
  const options = (isSet(accounts))
    ? accounts.map((addr, idx) => ({ key: addr, value: idx, text: addr.substr(0, 5) }))
    : []
  const selectedIndex = isSet(account) && isSet(accounts)
    ? accounts.findIndex(v => v === account.addr)
    : -1
  return (
    <Dropdown
      noResultsMessage="No accounts."
      value={selectedIndex}
      options={options}
      loading={options.length === 0}
      onChange={(data, { value }) => {
        const { key: addr } = options[value]
        dispatch(setAccount(addr))
      }}
    />
  )
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
