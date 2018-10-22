import React, { Component } from 'react'
import EthManager from "./EthManager.jsx"
import ClientsManager from "./ClientsManager.jsx"
import APICaller from "./APICaller.jsx"
import MessageBoard from "./MessageBoard.jsx"
import log from "../logger"
import '../main.css'
import "../css/bootstrap-4.1.0.min.css"

class App extends Component {
  render() {
    log.debug('App: render', this.props, this.state)
    return (
      <div className="container">
      <h1 className="mainTitle"> EthBnb </h1>
      <div className="row">
        <MessageBoard class="col-lg" bootstrapWidth="col-lg"/> 
      </div>
      <div className="row">
          <EthManager />
          <div className="col-lg">
            <ClientsManager />
          </div>
          <div className="col-lg-3">
            <APICaller />
          </div>
      </div>
      </div>
    )
  }
}

export default App
