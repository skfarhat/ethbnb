import React, { Component } from "react"
import ipfs from './IPFS'
import log from "../logger"

class IPFSImage extends Component {
  state={}

  static getDerivedStateFromProps(nextProps, prevState) {
    // Store hash in state so we can compare when props change.
    // Clear out any previously-loaded user data (so we don't render stale stuff).
    if (nextProps.hash !== prevState.hash || nextProps.file !== prevState.file) {
      return {
        hash: nextProps.hash,
        file: nextProps.file
      }
    }
    // No state update necessary
    return null
  }

  componentDidUpdate(prevProps) {
    log.debug("IPFSImage:: componentDidUpdate")
    if (prevProps.hash !== this.props.hash) {
      // At this point, we're in the "commit" phase, so it's safe to load the new data.
      this.loadUserData(this.props.hash)
    }
  }

  render() {
    log.debug("Rendering IPFSImage and the state is", this.state)
    return (
      <div>
            <img width="200px" id="ItemPreview" src={this.state.url} alt="Not loaded"/>
        </div>
    )
  }

  // Return the extension for the given file object
  getExtensionFromFile(file) {
    if (file) {
      return file.name.split('.').pop()
    } else {
      log.warn('getExtensionFromFile called without a file')
      return null
    }
  }

  loadUserData(hash) {
    log.debug("IPFSImage:: loadUserData")
    if (!hash) {
      log.error("Error: invalid hash provided to loadUserData")
    } else {
      const extension = this.getExtensionFromFile(this.props.file)
      ipfs.files.cat(hash, (err, data) => {
        const blob = new Blob([data], {
          type: "image/" + extension
        })
        this.setState({
          url: window.URL.createObjectURL(blob)
        })
        log.debug("IPFSImage, loadUserData changing state to ", this.state)
      })
    }
  }
}

export default IPFSImage
