import React from 'react'
import Rating from 'react-rating'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const MIN_RATING = 0
const MAX_RATING = 5

const EthRating = (props) => {
  return (
    <Rating
      start={MIN_RATING}
      stop={MAX_RATING}
      emptySymbol={<FontAwesomeIcon icon="star" color="grey" />}
      fullSymbol={<FontAwesomeIcon icon="star" color="orange" />}
      {...props}
    />
  )
}


export default EthRating
