import React, { Component } from 'react'
import { ipfs } from './IPFS'

class IPFSImage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      // We NEED to set url to empty string rather than null
      // so that it it fallback to 'onError' in render()
      url: '',
    }
  }

  componentDidMount() {
    const { hash, ext } = this.props
    this.loadUserData(hash, ext)
  }

  componentDidUpdate(prevProps) {
    const { hash, ext } = this.props
    if (prevProps.hash !== hash || prevProps.ext !== ext) {
      // At this point, we're in the "commit" phase, so it's safe to load the new data.
      this.loadUserData(hash, ext)
    }
  }

  loadUserData(hash, ext) {
    const self = this
    ipfs.files.cat(hash, (err, data) => {
      const blob = new Blob([data], { type: `image/${ext}` })
      self.setState({ url: window.URL.createObjectURL(blob) })
    })
  }

  render() {
    const { url } = this.state
    return (
      <div>
        <img width="200px" src={url} alt="not found"
          onError={(e) => {
            e.target.onerror = null
            e.target.src = 'http://localhost:3000/house-fallback.png'
          }}
        />
      </div>
    )
  }
}

export default IPFSImage
