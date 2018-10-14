import React, { Component } from 'react'
import EthManager from "./EthManager.jsx"
import ClientsManager from "./ClientsManager.jsx"
import APICaller from "./APICaller.jsx"
import '../main.css'

class App extends Component {
  render() {
    console.log('App: render', this.props, this.state)
    return (
      <div className="container">
      <h1 className="mainTitle"> EthBnb </h1>
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