import React, { Component } from 'react'
import log from '../../logger'
import ClientsManager from '../clients/ClientsManager'
import APICaller from '../APICaller'
import MessageBoard from '../MessageBoard'

class AdminPage extends Component {
  render() {
    return (
      <div className="row">
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
