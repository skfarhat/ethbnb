import React, { Component } from 'react'
import BigNumber from 'bignumber.js'
import log from '../logger'
import { ipfsFileUpload } from './IPFS'
import { getExtensionFromFile } from './Utils'

// Returns true if the current implementation supports the input type provided
// input.type is checked against the supported input types
const inputTypeIsSupported = (input) => {
  const SUPPORTED_TYPES = ['uint256', 'string']
  for (const i in SUPPORTED_TYPES) {
    if (input.type === SUPPORTED_TYPES[i]) return true
  }
  return false
}

// Converts the user input value to the type expected by the API given the
// input type. This method is expected to be called by inputChanged.
const convertInputValue = (value, type) => {
  if (type === 'uint256') return new BigNumber(value)
  return value
}

// React component
//
// Props:
//
//  abiFunction:  the dict object extracted from the ABI.
//                It denotes the name of the solidity function, its inputs, outputs,
//                whether its constant.
//
//  isDisabled:   boolean value indicating if this APICommand should be disabled
//
class APICommand extends Component {
  constructor(props) {
    super(props)
    this.ipfsImageUpload = this.ipfsImageUpload.bind(this)
    this.state = { ipfsHash: null }
  }

  // Uploads the image to IPFS and modifies the state with the returned hash
  async ipfsImageUpload() {
    const self = this
    // Get the uploaded file image
    const photo = document.getElementById(self.props.abiFunction.name)
    const file = photo.files[0]
    try {
      const ipfsHash = await ipfsFileUpload(file)
      const extension = getExtensionFromFile(file)
      // Set the ipfsHash value in abiFunction
      const abiInputForIPFSHash = self.findInputFromAbiFunction('ipfsHash')
      const abiInputForExtension = self.findInputFromAbiFunction('extension')
      abiInputForIPFSHash.value = ipfsHash
      abiInputForExtension.value = extension
      self.setState({
        ipfsHash,
        extension,
      })
    } catch (err) {
      console.log('could not run ipfsFileUpload', err)
      log.error(err)
    }
  }

  // Return the input with the given name from this.abiFunction
  findInputFromAbiFunction(name) {
    const self = this
    const inputs = self.props.abiFunction.inputs
    // Find the input field associated with the event target and
    // change the property 'value' in it.
    for (let i = 0; i < inputs.length; i += 1) {
      if (inputs[i].name === name) {
        return inputs[i]
      }
    }
    return null
  }

  // Called when the input to a text field is changed
  inputChanged(evt) {
    evt.preventDefault()
    const inputElem = evt.target
    const newVal = (evt.target.value.length === 0) ? '0' : evt.target.value
    const input = this.findInputFromAbiFunction(inputElem.name)
    try {
      input.value = convertInputValue(newVal, input.type)
      inputElem.classList.remove('is-invalid')
    } catch (e) {
      inputElem.classList.add('is-invalid')
    }
  }

  // Return a DOM of input elements based on the ABI functions provided
  generateInputFields(inputs) {
    // Set this to true if the function input parameter is unsupported
    // and we don't want to include that function as an API button.
    let unsupportedInput = false
    // Populated with the inputs and return
    const ret = []
    for (let j = 0; j < inputs.length; j += 1) {
      const input = inputs[j]
      if (!inputTypeIsSupported(input)) {
        log.warn('Skipping input.type', input.type, '.Still unsupported.')
        unsupportedInput = true
        break
      } else if (input.name.toLowerCase().indexOf('ipfshash') > -1) {
        ret.push(
          <div key="ipfs-upload" className="ipfs-image-upload">
            <input
              id={this.props.abiFunction.name}
              key="button"
              type="file"
              onChange={this.ipfsImageUpload}
            />
            <p key="p2">{this.state.ipfsHash}</p>
            <p key="p1">
Extension:
              {this.state.extension}
            </p>
          </div>,
        )
      } else {
        // 'extension' inputs are disabled because we infer them from the uploaded image
        // directly. Web user need not worry/input anything.
        const isDisabled = input.name.indexOf('extension') > -1
        ret.push(
          <input
            type="text"
            key={input.name}
            input-type={input.type}
            name={input.name}
            className="form-control"
            aria-describedby={`${input.name}Help`}
            placeholder={`${input.name} (${input.type})`}
            onChange={evt => this.inputChanged(evt)}
            disabled={isDisabled}
          />,
        )
      }
    }
    this.buttonDisabled = unsupportedInput
    return ret
  }

  render() {
    // console.log('rendering APICommand', this.state, this.props)
    const func = this.props.abiFunction
    return (
      <div className="apiCommand">
        <button
          key="button"
          className="btn btn-default"
          type="button"
          disabled={this.props.isDisabled}
          onClick={evt => this.props.handleButtonClick(evt, func)}
        >
          {func.name}
        </button>
        <small className="form-text text-muted">
          {' '}
          { (func.constant) ? 'This function is constant' : '' }
          {' '}
        </small>
        {this.generateInputFields(func.inputs)}
      </div>
    )
  }
}

export default APICommand
