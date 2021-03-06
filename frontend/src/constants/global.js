const API_URL = 'http://localhost:3001/api'
const SERVER_POST_NEW_LISTING = `${API_URL}/listings/new`

const isSet = val => val !== null && typeof (val) !== 'undefined'
const hasKey = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key)


// We don't want to use moment or other external libraries (yet)
// so we do the date string formatting manually
//
// If input date is a string and not an instance of Date,
// we try to be nice and convert it.
//
// Returns an empty string if invalid date provided
//
function formatDate(date) {
  if (!isSet(date)) {
    return ''
  }
  if (typeof (date) === 'string' && !isNaN(Date.parse(date))) {
    date = new Date(Date.parse(date))
  }
  const day = date.getDate()
  const month = 1 + date.getMonth()
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

const capitaliseWord = (word) => {
  return word[0].toUpperCase() + word.substr(1)
}

export {
  API_URL,
  SERVER_POST_NEW_LISTING,
  isSet,
  hasKey,
  formatDate,
  capitaliseWord,
}
