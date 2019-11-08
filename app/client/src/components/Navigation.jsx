import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter, Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { Menu, Image } from 'semantic-ui-react'
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
          <Menu.Item id="logo-item">
            <Menu.Header>
                <Image src="/house-logo-small.png" size="mini" style={{ marginRight: '10px' }} />
            </Menu.Header>
              <h5> Ethbnb </h5>
          </Menu.Item>
        </Link>
        <Menu.Menu position="right">
          <Menu.Menu position="left">
            {balanceDOM}
          </Menu.Menu>
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
