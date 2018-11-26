import React, { Component } from 'react'
import { connect } from 'react-redux'
import log from '../logger'
import { SERVER_NODE_URL } from '../constants/global'
import { getAllListings } from '../actions'


const mapDispatchToProps = dispatch => ({
  dispatchMethods: {
    getAllListings: listings => dispatch(getAllListings(listings)),
  },
})

class ServerNodeManager extends Component {
  componentDidMount() {
    const self = this
    fetch(`${SERVER_NODE_URL}api/listings`)
      .then(response => response.json())
      .then((listingsData) => {
        log.debug(self.props)
        self.props.dispatchMethods.getAllListings(listingsData)
      })
      .catch(err => log.error('ERROR: request error', err))
  }

  render() {
    return (
      <div className="row" hidden />
    )
  }
}

export default connect(null, mapDispatchToProps)(ServerNodeManager)
