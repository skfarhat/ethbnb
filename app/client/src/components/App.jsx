import React, { Component } from 'react'
import { connect } from 'react-redux'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import PropTypes from 'prop-types'
import Web3 from 'web3'
import ListingView from './pages/ListingView'
import ListingSearch from './pages/ListingSearch'
import Navigation from './pages/Navigation'
import { setWeb3Js } from '../redux/actions'


class App extends Component {
  constructor() {
    super()
    this.onWindowLoad = this.onWindowLoad.bind(this)
  }

  componentDidMount() {
    window.addEventListener('load', this.onWindowLoad)
  }

  onWindowLoad() {
    const { dispatch } = this.props
    console.log(this)
    console.log('web3', window.web3)
    let web3js
    if (typeof window.web3 !== 'undefined') {
      // Use Mist/MetaMask's provider
      web3js = new Web3(window.web3.currentProvider)
    } else {
      console.log('No web3? You should consider trying MetaMask!')
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      web3js = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
    }
    dispatch(setWeb3Js(web3js))
  }

  render() {
    return (
      <Router>
        <div className="container">
          <Navigation />
          <Route exact path="/listing" component={ListingSearch} />
          <Route path="/listing/:lid" component={ListingView} />
        </div>
      </Router>
    )
  }
}


App.contextTypes = {
  web3: PropTypes.object,
}


export default connect()(App)
