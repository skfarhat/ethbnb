import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter, Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { Menu } from 'semantic-ui-react'


class Navigation extends Component {
  render() {
    const { history } = this.props
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

Navigation.propTypes = {
  history: PropTypes.object.isRequired,
}

export default connect()(withRouter(Navigation))
