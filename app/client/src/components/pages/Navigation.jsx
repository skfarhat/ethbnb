import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { Menu, Dropdown } from 'semantic-ui-react'
import AccountDropdown from './AccountDropdown'


class Navigation extends Component {
  render() {
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
          <Menu.Item>
            <AccountDropdown />
          </Menu.Item>
        </Menu.Menu>
      </Menu>
    )
  }
}

export default Navigation
