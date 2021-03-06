import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import ImageUploader from 'react-images-upload'
import { Button, Loader } from 'semantic-ui-react'
import { ipfsFileUpload } from './IPFS'
import { isSet } from '../constants/global'

const MAX_FILE_SIZE = 5242880 /* 5Mb */

// Uploader status
const STATUS_NO_FILES = 0
const STATUS_NOT_UPLOADED = 1
const STATUS_UPLOADING = 2
const STATUS_READY = 3

// Returns true if all all objects in the provided list
// have the provided property.
//
// Returns false if @list is empty
//
// @list        list containing objects to be checked for having property
// @property    the property which all objects must have
const allObjsHaveProperty = (list, property) => {
  if (!isSet(list) || list.length === 0) {
    return false
  }
  return list.filter(e => isSet(e) && isSet(e[property])).length === list.length
}

const IPFSImageUploader = (props) => {
  const [status, setStatus] = useState(STATUS_NO_FILES)
  const [images, setImages] = useState([])
  const [ipfsImages, setIpfsImages] = useState([])
  const { autoUpload } = props

  const ipfsUpload = () => {
    console.log('ipfsUpload')
    console.log('the images are', images)
    if (!isSet(images) || images.length === 0) {
      return
    }
    setStatus(STATUS_UPLOADING)
    Object.values(images).forEach((image, idx) => {
      console.log('ipfsUpload - ', image)
      ipfsFileUpload(image).then((obj) => {
        console.log('the obj is', obj)
        const { hash } = obj
        if (isSet(hash)) {
          setIpfsImages((oldIpfsImages) => {
            return Object.assign([], oldIpfsImages, { [idx]: {
              ...obj,
              name: image.name,
              type: image.type,
            } })
          })
        }
      }).catch((err) => {
        console.log('error', err)
        setStatus(STATUS_NOT_UPLOADED)
      })
    })
  }

  // Callback for when the user selects input images
  // from their filesystem.
  //
  // Side-effect: if props.autoUpload is set to true
  // this callback will start uploading images to the IPFS
  // server directly.
  const onDrop = (files) => {
    if (isSet(files) && files.length > 0) {
      setStatus(STATUS_NOT_UPLOADED)
      setImages(Object.assign([], files))
      setIpfsImages(new Array(files.length))
    }
  }

  // Each time ipfsImages is changed, we check to see if all
  // objects have 'hash' as property and when they do,
  // we set the status to 'STATUS_READY'
  useEffect(() => {
    if (allObjsHaveProperty(ipfsImages, 'hash')) {
      const { onUploadDone } = props
      setStatus(STATUS_READY)
      if (isSet(onUploadDone)) {
        onUploadDone(ipfsImages)
      }
    }
  }, [ipfsImages])

  // If @images are set and autoUpload is true
  // trigger ipfsUpload
  useEffect(() => {
    if (autoUpload) ipfsUpload()
  }, [images])

  return (
    <div className="ipfs-image-uploader">
      {
        // Only show the button if autoUpload is false
        // Show message if autoUpload is true and upload has completed
        autoUpload
          ? (status === STATUS_READY ? 'Images uploaded ✅' : '')
          : (
            <Button
              disabled={status !== STATUS_NOT_UPLOADED}
              onClick={ipfsUpload}
            >
              {(status === STATUS_READY ? 'Images uploaded ✅' : 'Upload images')}
            </Button>
          )

      }
      <Loader
        active={status === STATUS_UPLOADING}
        inline="centered"
        content="Uploading to IPFS..."
      />
      <ImageUploader
        withIcon
        withLabel
        withPreview
        buttonText="Choose images"
        onChange={onDrop}
        style={{ maxWidth: '500px', margin: '0 auto' }}
        imgExtension={['.jpg', '.gif', '.png', '.gif']}
        maxFileSize={MAX_FILE_SIZE}
      />
    </div>
  )
}

IPFSImageUploader.defaultProps = {
  // When true, file(s) upload will being as soon
  // as they are selected. Defaults to false.
  autoUpload: false,
}

IPFSImageUploader.propTypes = {
  autoUpload: PropTypes.bool,
}

export default IPFSImageUploader
