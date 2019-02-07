import React, { Component } from 'react'
import { connect } from 'react-redux'
import { SERVER_NODE_URL } from '../constants/global'
import { setListingResults } from '../actions'


const mapDispatchToProps = dispatch => ({
  dispatchMethods: {
    setListingResults: listings => dispatch(setListingResults(listings)),
  },
})

class ServerNodeManager extends Component {
  componentDidMount() {
    const self = this
    fetch(`${SERVER_NODE_URL}api/listings`)
      .then(response => response.json())
      .then((listingsData) => {
        console.log(self.props)
        self.props.dispatchMethods.setListingResults(listingsData)
      })
      .catch(err => console.log(`ServerNodeManager:: failed to connect to ${SERVER_NODE_URL}`, err))
  }

  render() {
    return (
      <div className="row" hidden />
    )
  }
}

export default connect(null, mapDispatchToProps)(ServerNodeManager)
