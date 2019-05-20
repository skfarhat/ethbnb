import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { Form, Input, Button, TextArea } from 'semantic-ui-react'
import { createListing } from '../redux/listingActions'
import CountryPicker from './CountryPicker'
import { getAddr } from '../redux/accountActions'
import { capitaliseWord, isSet } from '../constants/global'
import IPFSImageUploader from './IPFSImageUploader'

class ListingCreate extends Component {
  constructor(props) {
    super(props)
    this.getTopButtons = this.getTopButtons.bind(this)
    this.saveButtonClicked = this.saveButtonClicked.bind(this)
    this.onChange = this.onChange.bind(this)
    this.getInput = this.getInput.bind(this)
    this.onImageUploadDone = this.onImageUploadDone.bind(this)
    this.onCountryPickerChange = this.onCountryPickerChange.bind(this)
    this.state = {
      title: '',
      description: '',
      location: '',
      country: '',
      price: '',
      images: [],
      saveDisable: true,
      // A dictionary with input names as keys
      // and booleans as values. True values indicate
      // there is an error in the input formatting
      // e.g. a non-number for price
      inputErrors: {

      },
    }
  }

  onChange(evt) {
    const { name } = evt.target
    const saveDisable = false
    const { inputErrors } = this.state
    const { value } = evt.target

    // Handle any input checks needed in the if statements below
    let inputError
    if (name === 'title') {
      // Something here?
    } else if (name === 'description') {
      // Something here?
    } else if (name === 'price') {
      inputError = (value.length !== 0 && !isFinite(value))
    }

    this.setState({
      [name]: value,
      saveDisable,
      inputErrors: {
        ...inputErrors,
        [name]: inputError,
      },
    })
  }

  onCountryPickerChange(evt, data) {
    console.log('onCountryPickerChange')
    this.setState({
      country: data.value,
    })
  }

  onImageUploadDone(images) {
    this.setState({ images })
  }

  getInput(name) {
    const { inputErrors } = this.state
    const error = (isSet(inputErrors[name])) ? inputErrors[name] : false
    const placeholder = capitaliseWord(name)
    return (
      <div>
        <Input
          name={name}
          className="new-listing-input"
          placeholder={placeholder}
          error={error}
          onChange={this.onChange}
        />
      </div>
    )
  }

  getTopButtons() {
    const { saveDisable } = this.state
    return (
      <div className="top-buttons">
        <Link
          key="back-button"
          to="/listing/"
        >
          <Button>
            Back
          </Button>
        </Link>
        <Button onClick={this.saveButtonClicked} disabled={saveDisable}>
            Save
        </Button>
      </div>
    )
  }

  saveButtonClicked() {
    const { addr, dispatch } = this.props
    const { title, description, location, country, price, images } = this.state
    const chaindata = [country, location, price]
    const metadata = {
      title,
      description,
      images,
    }
    const other = { eventName: 'CreateListingEvent' }
    dispatch(createListing(chaindata, metadata, addr, other))
  }

  render() {
    return (
      <div className="new-listing">
        { this.getTopButtons() }
        <div className="new-listing-container">
          <IPFSImageUploader
            autoUpload
            onUploadDone={this.onImageUploadDone}
          />
          <div className="new-listing-inputs">
            { this.getInput('title') }
            { this.getInput('price') }
            { this.getInput('location') }
            <CountryPicker
              onChange={this.onCountryPickerChange}
            />
            <div>
              <Form>
                <TextArea name="description" placeholder="Description.." onChange={this.onChange} />
              </Form>
            </div>
          </div>
        </div>
      </div>
    )
  }
}


ListingCreate.propTypes = {
  dispatch: PropTypes.func.isRequired,
}

const mapStateToProps = state => ({
  addr: getAddr(state),
})

export default connect(mapStateToProps)(ListingCreate)
