import React, { Component } from 'react'
import PropTypes from 'prop-types'
import DictTable from '../tables/DictTable'

function bigNumberToDate(bigNumber) {
  return new Date(parseInt(bigNumber.toString(), 10) * 1000).toString()
}

class Account extends Component {
  render() {
    const { data: propsData } = this.props
    // Convert dateCreated property from BigNumber to string
    let data = {}
    if (propsData) {
      data = {
        ...propsData,
        dateCreated: bigNumberToDate(propsData.dateCreated),
      }
    }
    return (
      <DictTable data={data} title="BnB Account" />
    )
  }
}
Account.propTypes = { data: PropTypes.object }
export default Account
