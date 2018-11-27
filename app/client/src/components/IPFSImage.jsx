import React, { Component } from 'react'
import { ipfs } from './IPFS'
import log from '../logger'

class IPFSImage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      url: null,
    }
  }

  componentDidMount() {
    this.loadUserData(this.props.hash)
  }

  componentDidUpdate(prevProps) {
    if (prevProps.hash !== this.props.hash) {
      // At this point, we're in the "commit" phase, so it's safe to load the new data.
      this.loadUserData(this.props.hash)
    }
  }

  loadUserData(hash) {
    const self = this
    if (!hash) {
      log.error('IPFSImage:: invalid hash provided to loadUserData')
    } else {
      ipfs.files.cat(hash, (err, data) => {
        const blob = new Blob([data], {
          type: `image/${self.props.ext}`,
        })
        self.setState({
          url: window.URL.createObjectURL(blob),
        })
      })
    }
  }

  render() {
    return (
      <div>
        <img width="200px" id="ItemPreview" src={this.state.url} alt="Image not loaded" />
      </div>
    )
  }
}

export default IPFSImage
