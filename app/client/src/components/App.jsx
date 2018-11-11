import React, { Component } from 'react'
import EthManager from "./EthManager"
import ClientsManager from "./clients/ClientsManager"
import APICaller from "./APICaller"
import MessageBoard from "./MessageBoard"
import log from "../logger"
import "../css/bootstrap-4.1.0.min.css"
import 'react-table/react-table.css'
import '../main.css'

class App extends Component {
  render() {
    log.debug('App: render', this.props, this.state)
    return (
      <div className="container">
      <h1 className="mainTitle"> EthBnb </h1>
      <EthManager />
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
      </div>
    )
  }
}

export default App
