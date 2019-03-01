import React, { Component } from 'react'
import { connect } from 'react-redux'


class AccountPage extends Component {
  render() {
    const { selectedAccountIndex, accounts } = this.props
    return (
      <div className="accounts-page">
        {`Welcome to the accounts page: ${accounts[selectedAccountIndex]}`}
      </div>
    )
  }
}

const mapStateToProps = state => ({
  accounts: state.accounts,
  selectedAccountIndex: state.selectedAccountIndex,
})

export default connect(mapStateToProps)(AccountPage)
