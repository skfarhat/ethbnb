import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter, Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { Menu } from 'semantic-ui-react'
import { isSet } from '../constants/global'

class Navigation extends Component {
  render() {
    const { history, account } = this.props
    const balanceDOM = (isSet(account))
      ? (<Menu.Item> Balance: {account.balance} ETH </Menu.Item>)
      : ''
    return (
      <Menu>
        <Link to="/listing/">
          <Menu.Item
            name="editorials"
            active
          >
            EthBnB
          </Menu.Item>
        </Link>
        <Menu.Menu position="right">
          {balanceDOM}
        </Menu.Menu>
        <Menu.Menu position="right">
          <Menu.Item
            name="New Listing"
            onClick={() => history.push('/new-listing')}
          />
          <Menu.Item
            name="Profile"
            onClick={() => history.push('/account')}
          />
        </Menu.Menu>
      </Menu>
    )
  }
}

Navigation.defaultTypes = {
  account: null,
}

Navigation.propTypes = {
  history: PropTypes.object.isRequired,
  account: PropTypes.object,
}


const mapStateToProps = state => ({
  account: state.account,
})

export default connect(mapStateToProps)(withRouter(Navigation))
