import log from "../logger"
import React, { Component } from 'react'
import BigNumber from 'bignumber.js'


class APICommand extends Component {

  // Converts the user input value to the type expected by the API given the
  // input type. This method is expected to be called by inputChanged.
  convertInputValue(value, type) {
    if (type === "uint256")
      return new BigNumber(value)
    else
      return value
  }

  // Called when the input to a text field is changed
  inputChanged(evt) {
    evt.preventDefault()
    let inputElem = evt.target
    // Find the input field associated with the event target and
    // change the property 'value' in it.
    for (var i = 0; i < this.props.inputs.length; i++) {
      let input = this.props.inputs[i]
      if (input.name === inputElem.name) {
        input.value = this.convertInputValue(evt.target.value, input.type)
      }
    }
  }

  // Returns true if the current implementation supports the input type provided
  // input.type is checked against the supported input types
  inputTypeIsSupported(input) {
    const SUPPORTED_TYPES = ["uint256", "string"]
    for (var i in SUPPORTED_TYPES) {
      if (input.type === SUPPORTED_TYPES[i])
        return true
    }
    return false
  }

  generateInputFields() {
    let inputs = this.props.inputs
    // Parse the inputs of this function and create a list of DOM elements
    let inputsDom = []
    // Set this to true if the function input parameter is unsupported and we don't want to include that function
    // as an API button.
    let unsupportedInput = false
    for (var j = 0; j < inputs.length; j++) {
      var input = inputs[j]
      if ( !this.inputTypeIsSupported(input) ) {
        log.warn("Skipping input.type", input.type, ". Still unsupported.");
        unsupportedInput = true
        break
      }
      inputsDom.push(
        <div key={input.name}>
          <input
          type="text"
          input-type={input.type}
          name={input.name}
          placeholder={input.name}
          onChange={(evt) => this.inputChanged(evt)} />
        </div>
      )
    }
    this.inputsDom = React.createElement(
      'div',
      {},
      inputsDom)
    this.buttonDisabled = unsupportedInput

    return inputsDom
  }

  render() {
    return (
      <div className="apiCommand">
        <button
      key="button"
      className="btn btn-default"
      type="button"
      disabled={this.buttonDisabled}
      onClick={(evt) => this.props.handleButtonClick(evt, this.props.name, this.props.inputs)}>
        {this.props.name}
        </button>
        {this.generateInputFields()}
      </div>
      );
  }
}

export default APICommand
