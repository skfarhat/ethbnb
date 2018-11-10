import log from '../../logger'
import React, { Component } from 'react'
import DictTable from '../tables/DictTable'

class Account extends Component {

  bigNumberToDate(bigNumber) {
    return new Date(parseInt(bigNumber.toString()) * 1000).toString()
  }

  render() {
    log.debug("Account:: render()", this.props)
    // Convert dateCreated property from BigNumber to string
    let data = {}
    if (this.props.data) {
        data = {
            ...this.props.data,
            dateCreated: this.bigNumberToDate(this.props.data.dateCreated)
        }
    }
    return (
        <DictTable data={data} title="BnB Account"/>
      )
  }
}
export default Account
