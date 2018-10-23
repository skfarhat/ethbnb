import log from "../logger"
import React, { Component } from 'react'


class APICommand extends Component {

  // Called when the input to a text field is changed
  textInputChanged(evt, name) {
    evt.preventDefault()
    // Find the input field associated with the event target and
    // change the property 'value' in it.
    for (var i = 0; i < this.props.inputs.length; i++) {
      let input = this.props.inputs[i]
      if (input.name === name) {
        input.value = evt.target.value
      }
    }
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
      if (input.type !== "uint256" && input.type !== "string") {
        log.warn("Skipping input.type", input.type, ". Still unsupported.");
        unsupportedInput = true
        break
      }
      inputsDom.push(
        <div key={input.name}>
          <input
          type="text"
          name={input.name}
          placeholder={input.name}
          onChange={(evt) => this.textInputChanged(evt, input.name)} />
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
