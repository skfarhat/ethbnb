import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import { Message } from 'semantic-ui-react'
import Web3 from 'web3'
import ListingView from './pages/ListingView'
import ListingSearch from './pages/ListingSearch'
import Navigation from './pages/Navigation'
import AccountPage from './pages/AccountPage'
import NewListing from './pages/NewListing'
import { setWeb3Js } from '../redux/actions'


class App extends Component {
  constructor() {
    super()
    this.onWindowLoad = this.onWindowLoad.bind(this)
    this.handleDismiss = this.handleDismiss.bind(this)
  }

  componentDidMount() {
    window.addEventListener('load', this.onWindowLoad)
  }

  onWindowLoad() {
    const { dispatch } = this.props
    const web3js = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
    dispatch(setWeb3Js(web3js))
  }

  handleDismiss() {
    console.log('handleDismiss')
  }

  // Returns DOM representing messages
  // that need showing
  showMessages() {
    const { messages } = this.props
    const ret = []
    const allTypes = {
      info: false,
      error: false,
      warning: false,
      positive: false,
    }
    Object.values(messages).forEach((message, idx) => {
      // type should be 'error', 'info', 'warning'
      const { type, text, header } = message
      allTypes[type] = true
      ret.push(
        <Message {...allTypes} key={idx}  onDismiss={this.handleDismiss}>
          <Message.Header>{header}</Message.Header>
          <p>{text}</p>
        </Message>,
      )
    })
    return ret
  }

  render() {
    return (
      <Router>
        <div className="container">
          <Navigation />
          { this.showMessages() }
          <Route exact path="/listing" component={ListingSearch} />
          <Route exact path="/account" component={AccountPage} />
          <Route path="/listing/:lid" component={ListingView} />
          <Route path="/new-listing" component={NewListing} />
        </div>
      </Router>
    )
  }
}

App.propTypes = {
  dispatch: PropTypes.func.isRequired,
}

const mapStateToProps = state => ({
  messages: state.messages,
})

export default connect(mapStateToProps)(App)
