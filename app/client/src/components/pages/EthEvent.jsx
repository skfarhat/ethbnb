import React, { Component } from 'react'
import PropTypes from 'prop-types'

class EthEvent extends Component {
  render() {
    const { event: name, blockNumber, address, logIndex, returnValues } = this.props
    return (
      <div className="eth-event">
        <span> { logIndex } </span>
        <span> { blockNumber } </span>
        <span> { name } </span>
        <span> { address } </span>
        <span> from: { returnValues.from } </span>
      </div>
    )
  }
}


EthEvent.propTypes = {
}

export default EthEvent
