import React, { Component } from 'react'
import { ipfs } from './IPFS'
import log from '../logger'

class IPFSImage extends Component {
  constructor(props) {
    super(props)
    this.state = { url: null }
  }

  componentDidMount() {
    const { hash } = this.props
    this.loadUserData(hash)
  }

  componentDidUpdate(prevProps) {
    const { hash } = this.props
    if (prevProps.hash !== hash) {
      // At this point, we're in the "commit" phase, so it's safe to load the new data.
      this.loadUserData(hash)
    }
  }

  loadUserData(hash) {
    const self = this
    if (!hash) {
      log.error('IPFSImage:: invalid hash provided to loadUserData')
    } else {
      ipfs.files.cat(hash, (err, data) => {
        const blob = new Blob([data], { type: `image/${self.props.ext}` })
        self.setState({ url: window.URL.createObjectURL(blob) })
      })
    }
  }

  render() {
    const { url } = this.state
    return (
      <div>
        <img width="200px" id="ItemPreview" src={url} alt="Image not loaded" />
      </div>
    )
  }
}

export default IPFSImage
