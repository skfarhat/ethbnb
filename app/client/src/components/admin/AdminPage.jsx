import React, { Component } from 'react'
import ClientsManager from './clients/ClientsManager'
import APICaller from './APICaller'
import MessageBoard from './MessageBoard'
import EthManager from './EthManager'

class AdminPage extends Component {
  render() {
    return (
      <div className="row">
        <EthManager />
        <div className="container-col col-lg-2">
          <MessageBoard />
        </div>
        <div className="container-col col-lg">
          <ClientsManager />
        </div>
        <div className="container-col col-lg-2">
          <APICaller />
        </div>
      </div>
    )
  }
}

export default AdminPage
