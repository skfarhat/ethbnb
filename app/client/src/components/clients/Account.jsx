import log from '../../logger'
import React, { Component } from 'react'
import DictTable from './Tables'

class Account extends Component {

  bigNumberToDate(bigNumber) {
    return new Date(parseInt(bigNumber.toString()) * 1000).toString()
  }

  render() {
    log.debug("Account:: render()", this.props)

    if (this.props.act !== null && this.props.act !== undefined) {
      this.props.act.dateCreated = this.bigNumberToDate(this.props.act.dateCreated)
      return (
        <DictTable
        data={this.props.act}
        />
      )
    } else {
      return (<div> <em> No account information. </em> </div>)
    }
  }
}
export default Account
