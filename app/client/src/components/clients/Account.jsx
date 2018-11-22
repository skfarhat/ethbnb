import React, { Component } from 'react'
import log from '../../logger'
import DictTable from '../tables/DictTable'

function bigNumberToDate(bigNumber) {
  return new Date(parseInt(bigNumber.toString()) * 1000).toString()
}

class Account extends Component {

  render() {
    log.debug('Account:: render()', this.props)
    // Convert dateCreated property from BigNumber to string
    let data = {}
    if (this.props.data) {
      data = {
        ...this.props.data,
        dateCreated: bigNumberToDate(this.props.data.dateCreated)
      }
    }
    return (
      <DictTable data={data} title="BnB Account"/>
    )
  }
}
export default Account
