import React, { Component } from 'react';

class Account extends Component {

  bigNumberToDate(bigNumber) {
    console.log(bigNumber.toString())
    return new Date(parseInt(bigNumber.toString()) * 1000).toString()
  }

  render(props) {
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

class Client extends Component {
  render() {
    const id = this.props.clientId
    const accountId = this.props.clientAddress
    const clientAccount = this.props.clientAccount
    // If the props.selected is true, then we add the class 'client-selected' to header
    const selectedClassName = this.props.selected ? "client-selected": ""
    return (
      <div className="col client-div" data-client-id="{id}">
        <h2 className={selectedClassName}> Client {id} </h2>
        <div>
          <em> Address </em>
          <span id="accountId"> {accountId} </span>
        </div>
        <Account act={clientAccount} />
    </div>
    )
  }
}

export default Client
