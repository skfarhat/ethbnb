import log from '../../logger'
import React, { Component } from 'react'

class Account extends Component {

  bigNumberToDate(bigNumber) {
    return new Date(parseInt(bigNumber.toString()) * 1000).toString()
  }

  render() {
    log.debug("Account:: render()", this.props)
    if (this.props.act !== null && this.props.act !== undefined) {
      return (
        <div>
          <table border="1">
          <tbody>
          <tr>
          <td colSpan="2"> <b> Account </b> </td>
          </tr>
            <tr>
              <td> Name </td>
              <td> {this.props.act.name} </td>
            </tr>
            <tr>
              <td> Date Created </td>
              <td> {this.bigNumberToDate(this.props.act.dateCreated)} </td>
            </tr>
          </tbody>
          </table>
        </div>
      )
    } else {
      return (<div> <em> No account information. </em> </div>)
    }
  }
}
export default Account
