import React from 'react'
import SemanticDatepicker from 'react-semantic-ui-datepickers'
import 'react-semantic-ui-datepickers/dist/react-semantic-ui-datepickers.css'
import '../../css/eth-datepicker.css'


const EthDatePicker = (props) => {
  return (
    <div className="datepicker-wrapper">
      <SemanticDatepicker
        type="range"
        {...props}
      />
    </div>
  // selected={(!fromDate || !toDate) ? [] : [fromDate, toDate]}
  )
}
export default EthDatePicker
