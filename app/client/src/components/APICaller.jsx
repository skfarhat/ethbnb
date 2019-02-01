import React, { Component } from 'react'
import { connect } from 'react-redux'
import log from '../logger'
import { selectClient, addMessage } from '../actions'
import TestDataLoader from './TestDataLoader'
import APICommand from './APICommand'
import { NONE_ADDRESS } from '../constants/global'

const mapStateToProps = state => ({
  eth: state.eth,
  clients: state.clients,
  abi: state.eth.abi,
  selectedClientAddr: state.selectedClientAddr,
})

// Returns a dictionary of input => value if all inputs have had their values set (not empty).
// it does not check whether the values they have been set to conform to the type of the input).
// Returns null if any of the inputs has not been set.
const validateAndMapCommandInputs = (inputs) => {
  const ret = inputs.map(in1 => in1.value)
  for (const k in ret) {
    if (!ret[k] || ret[k].length === 0) return null
  }
  return ret
}

const mapDispatchToProps = dispatch => ({
  selectClient: addr => dispatch(selectClient(addr)),
  addMessage: message => dispatch(addMessage(message)),
})

class APICaller_ extends Component {
  constructor(props) {
    super(props)
    // Bind the callback function to allow it access to state and props
    this.apiCommandTriggered = this.apiCommandTriggered.bind(this)
  }

  // Called when the select (dropdown) changes.
  clientSelectChanged(evt) {
    const { selectClient } = this.props
    selectClient(evt.target.value)
  }

  // Returns the first function in eth.abi that matches name, or null if not found.
  findFunctionWithName(eth, name) {
    let foundFunction = null
    for (let i = 0; i < eth.abi.length; i++) {
      const o = eth.abi[i]
      if (o.type === 'function' && o.name === name) {
        foundFunction = o
        break
      }
    }
    return foundFunction
  }

  async runAPICommand(eth, apiCmd, from) {
    // Used in transactions and local eth calls
    const lastParam = {
      from,
      gas: 1000000,
    }
    const { name, constant } = apiCmd
    const inputs = validateAndMapCommandInputs(apiCmd.inputs)
    if (!inputs) {
      return new Error('runAPICommand failed due to invalid inputs in apiCmd.')
    }
    if (!this.findFunctionWithName(eth, name)) {
      return new Error('runAPICommand failed due to invalid function name in apiCmd.')
    }
    try {
      const func = eth.contractInstance[name]
      // Here we check whether the function to execute is a constant one.
      // If so, we make a local 'call' and get the result immediately.
      // If the function is state-changing, we issue a transaction.
      // The result will later be brought back to us via an event.
      if (constant) {
        return func.call(...inputs, lastParam)
      }
      return func.sendTransaction(...inputs, lastParam)
    } catch (err) {
      return err
    }
  }

  async apiCommandTriggered(evt, apiCmd) {
    evt.preventDefault()
    const { eth, addMessage, selectedClientAddr } = this.props

    try {
      const result = await this.runAPICommand(eth, apiCmd, selectedClientAddr)
      if (!apiCmd.hasOwnProperty('constant')) {
        log.error('Invalid apiCmd object does not have field "constant" set.')
        return
      }
      if (apiCmd.constant) {
        addMessage({ text: `Local call ${apiCmd.name} has been made. Result is: ${result}` })
      } else {
        const txHash = result
        addMessage({ text: `Transaction ${apiCmd.name} ${txHash.substr(0, 5)} has been submitted.` })
        eth.web3.eth.getTransactionReceipt(txHash, (err, txObj) => {
          if (err) {
            addMessage({
              text: `Got error in getTransactionReceipt${err}`,
              data: err,
            })
          } else {
            addMessage({ text: `Transaction ${txObj.transactionHash.substr(0, 5)} used ${txObj.gasUsed}` })
          }
        })
      }
    } catch (err) {
      log.error('runAPICommand failed.', err)
    }
  }

  parseABIForFunctions() {
    // We will return this after populating
    const ret = []
    const { abi } = this.props
    if (!abi) return ret

    for (let i = 0; i < abi.length; i += 1) {
      const o = abi[i]
      // Skip non-functions
      if (o.type !== 'function') {
        continue
      } else {
        ret.push(
          <APICommand
            key={o.name}
            abiFunction={o}
            isDisabled={this.props.selectedClientAddr === NONE_ADDRESS}
            handleButtonClick={(evt, self) => this.apiCommandTriggered(evt, self)}
          />,
        )
      }
    }
    return ret
  }

  render() {
    const { eth, clients } = this.props
    log.debug('APICaller: render')
    return (
      <div className="apiCaller">
        <h2 key="title"> API </h2>
        <p>
          {' '}
          Selected client:
          {this.props.selectedClientAddr.substr(0, 7)}
          {' '}
        </p>
        <TestDataLoader dispatchRunAPICommand={(data, clientAddr) => this.runAPICommand(eth, data, clientAddr)} />
        {this.parseABIForFunctions()}
      </div>
    )
  }
}

const APICaller = connect(mapStateToProps, mapDispatchToProps)(APICaller_)
export default APICaller
