import moment from 'moment'

export const SERVER_NODE_URL = 'http://localhost:3001/'
export const SERVER_PUBLIC_URL = `${SERVER_NODE_URL}api/public/`

export const isSet = val => val !== null && typeof (val) !== 'undefined'
export const hasKey = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key)
export const formatDate = (date) => {
  if (!isSet(date)) {
    return ''
  }
  return moment(date.toString()).format('DD/MM/YY')
}
