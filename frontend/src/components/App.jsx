import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import { Message } from 'semantic-ui-react'
import Web3 from 'web3'
import ListingView from './ListingView'
import ListingSearch from './ListingSearch'
import Navigation from './Navigation'
import AccountPage from './AccountPage'
import ListingCreate from './ListingCreate'
import { setWeb3Js, setWeb3JsWithMetamask, REMOVE_MESSAGE } from '../redux/actions'


class App extends Component {
  constructor() {
    super()
    this.onWindowLoad = this.onWindowLoad.bind(this)
    this.handleMessageDismiss = this.handleMessageDismiss.bind(this)
  }

  componentDidMount() {
    window.addEventListener('load', this.onWindowLoad)
  }

  onWindowLoad() {
    console.log('web3 is', Web3)
    // const { dispatch } = this.props
    // const web3js = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
    // dispatch(setWeb3Js(web3js))
    this.onWindowLoadWithMetamask()
  }

  onWindowLoadWithMetamask() {
    const { dispatch } = this.props
    const web3js = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
    dispatch(setWeb3JsWithMetamask(web3js))
  }

  handleMessageDismiss(key) {
    // Dispatch an event to remove the message
    const { dispatch } = this.props
    dispatch({
      type: REMOVE_MESSAGE,
      data: key,
    })
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
    Object.values(messages).forEach((message) => {
      // type should be 'error', 'info', 'warning'
      const { type, text, header, key } = message
      allTypes[type] = true
      ret.push(
        <Message key={key} {...allTypes} onDismiss={() => this.handleMessageDismiss(key)}>
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
          <Route path="/new-listing" component={ListingCreate} />
        </div>
      </Router>
    )
  }
}

App.propTypes = {
  dispatch: PropTypes.func.isRequired,
  messages: PropTypes.array.isRequired,
}

const mapStateToProps = state => ({
  messages: state.messages,
})

export default connect(mapStateToProps)(App)
