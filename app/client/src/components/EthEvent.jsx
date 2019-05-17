import React, { Component } from 'react'


class EthEvent extends Component {
  render() {
    const { event: name, transactionHash, returnValues } = this.props
    const rValuesDOM = {
      transactionHash,
    }
    Object.entries(returnValues).forEach((entry) => {
      // Only keep non-numeric keys
      if (Number.isNaN(parseInt(entry[0], 10))) {
        rValuesDOM[entry[0]] = entry[1]
      }
    })
    return (
      <div className="eth-event">
        <h5>
          { name }
        </h5>
        <table>
          <tbody>
            {
              Object.entries(rValuesDOM).map(e => (
                <tr key={e[0]}>
                  <td> { e[0] } </td>
                  <td> { e[1] } </td>
                </tr>
              ))
            }
          </tbody>
        </table>

      </div>
    )
  }
}


EthEvent.propTypes = {}

export default EthEvent
