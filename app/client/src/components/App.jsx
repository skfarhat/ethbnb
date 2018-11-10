import React, { Component } from 'react'
import EthManager from "./EthManager.jsx"
import ClientsManager from "./ClientsManager.jsx"
import APICaller from "./APICaller.jsx"
import MessageBoard from "./MessageBoard.jsx"
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
      </div>
    )
  }
}

export default App
