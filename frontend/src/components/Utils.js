
// Return the extension for the given file object
const getExtensionFromFile = (file) => {
  if (file) {
    return file.name.split('.').pop()
  }
  return null
}

const fileObjectFromImgDOM = async (imgDOM, filename) => new Promise((resolve, reject) => {
  fetch(imgDOM.src)
    .then(data => data.blob())
    .then((blob) => {
      const file = new File([blob], filename, blob)
      resolve(file)
    })
    .catch(err => reject(err))
})

export {
  getExtensionFromFile,
  fileObjectFromImgDOM,
}
