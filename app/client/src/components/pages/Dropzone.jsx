import React, { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import styled from 'styled-components'
import { Button, Loader } from 'semantic-ui-react'
import { ipfsFileUpload } from '../IPFS'
import { isSet } from '../../constants/global'

// Dropzone status
const STATUS_NO_FILES = 0
const STATUS_NOT_UPLOADED = 1
const STATUS_UPLOADING = 2
const STATUS_READY = 3

const getColor = (props) => {
  if (props.isDragAccept) {
    return '#00e676'
  }
  if (props.isDragReject) {
    return '#ff1744'
  }
  if (props.isDragActive) {
    return '#2196f3'
  }
  return '#eeeeee'
}

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border-width: 2px;
  border-radius: 2px;
  border-color: ${props => getColor(props)};
  border-style: dashed;
  background-color: #fafafa;
  color: #bdbdbd;
  outline: none;
  transition: border .24s ease-in-out;
`

export default function StyledDropzone(props) {
  const [url, setUrl] = useState(null)
  const [file, setFile] = useState(null)
  const [message, setMessage] = useState('Drag \'n\' drop some files here, or click to select files')
  const [ipfsHash, setIpfsHash] = useState(null)
  const [status, setStatus] = useState(STATUS_NO_FILES)
  const name = isSet(file) ? file.name : null

  const onDrop = (files) => {
    console.log('onDrop', files)
    if (isSet(files) && files.length > 0) {
      setFile(files[0])
      setStatus(STATUS_NOT_UPLOADED)
      setUrl(window.URL.createObjectURL(files[0]))
      const { onDrop: onDrop1 } = props
      if (isSet(onDrop1)) {
        onDrop1(files[0])
      }
    }
  }

  const ipfsUpload = () => {
    setStatus(STATUS_UPLOADING)
    ipfsFileUpload(file).then((hash) => {
      if (isSet(hash)) {
        setIpfsHash(hash)
        setMessage('✅')
        setStatus(STATUS_READY)
      }
    }).catch((err) => {
      console.log('error', err)
      setMessage(`Failed to upload ${name} ❌`)
      setStatus(STATUS_NOT_UPLOADED)
    })
  }

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({ accept: 'image/*', onDrop })

  const getContent = () => {
    switch (status) {
      case STATUS_NO_FILES: {
        return (<p> Drag n drop some files here, or click to select files </p>)
      }
      case STATUS_NOT_UPLOADED: {
        return (
          <Button
            onClick={ipfsUpload}
            disabled={!isSet(file)}
          >
          Upload to IPFS
          </Button>
        )
      }
      case STATUS_UPLOADING: {
        return (<Loader active={status === STATUS_UPLOADING} />)
      }
      case STATUS_READY: {
        return (
          <div>
            <p> Title: { name } </p>
            <p> { message } </p>
            <p> IPFS Hash: {ipfsHash} </p>
            <img
              className="IPFSImage"
              width="50px"
              height="50px"
              src={url}
              alt="not found"
              onError={(e) => {
                e.target.onerror = null
                e.target.src = 'http://localhost:3000/house-fallback.png'
              }}
            />
          </div>
        )
      }
      default: {
        return (<div> INVALID STATUS </div>)
      }
    }
  }

  return (
    <div className="container">
      <Container {...getRootProps({ isDragActive, isDragAccept, isDragReject })}>
        <input {...getInputProps()} />
      </Container>
      { getContent(status) }
    </div>
  )
}
