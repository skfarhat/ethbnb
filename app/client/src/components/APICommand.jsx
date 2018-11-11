import log from "../logger"
import React, { Component } from 'react'
import BigNumber from 'bignumber.js'


// React component 
// 
// Props: 
// 
//  abiFunction: the dict object extracted from the ABI. It denotes the name of the solidity function,
//  its inputs, outputs, whether its constant. 
//  isDisabled: boolean value indicating if this APICommand should be disabled
//  
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
    const newVal = (evt.target.value.length === 0) ? "0" : evt.target.value
    const inputs = this.props.abiFunction.inputs
    // Find the input field associated with the event target and
    // change the property 'value' in it.
    for (var i = 0; i < inputs.length; i++) {
      let input = inputs[i]
      if (input.name === inputElem.name) {
        try {
          input.value = this.convertInputValue(newVal, input.type)
          inputElem.classList.remove("is-invalid")
        } catch (e) {
          inputElem.classList.add("is-invalid")
        }
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

  // Return a DOM of input elements based on the ABI functions provided
  generateInputFields(inputs) {
    // Set this to true if the function input parameter is unsupported and we don't want to include that function
    // as an API button.
    let unsupportedInput = false
    // Populated with the inputs and return
    let ret = []
    for (var j = 0; j < inputs.length; j++) {
      var input = inputs[j]
      if (!this.inputTypeIsSupported(input)) {
        log.warn("Skipping input.type", input.type, ". Still unsupported.");
        unsupportedInput = true
        break
      }
      ret.push(
        <input
        type="text"
        key={input.name}
        input-type={input.type}
        name={input.name}
        className="form-control"
        aria-describedby={input.name + "Help"}
        placeholder={input.name + " (" + input.type + ")"}
        onChange={(evt) => this.inputChanged(evt)}
        />
      )
    }
    this.buttonDisabled = unsupportedInput
    return ret
  }

  render() {
    const func = this.props.abiFunction
    return (
      <div className="apiCommand">
        <button
      key="button"
      className="btn btn-default"
      type="button"
      disabled={this.buttonDisabled || this.props.isDisabled}
      onClick={(evt) => this.props.handleButtonClick(evt, this.props.abiFunction)}>
        {func.name}
        </button>
        <small className="form-text text-muted"> { (func.constant) ? "This function is constant" : "" } </small>
        {this.generateInputFields(func.inputs)}
      </div>
      );
  }
}

export default APICommand
