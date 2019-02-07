import React, { Component } from 'react'
import { connect } from 'react-redux'

const mapStateToProps = state => ({ messages: state.messages })


class MessageBoard extends Component {
  render() {
    const res = []
    const { messages } = this.props


    for (const i in messages) {
      const msg = messages[i]
      res.push(
        <p key={i}>
          {msg.text}
        </p>
        )
    }
    return (
      <div id="message-board" className={this.props.bootstrapWidth}>
        <h3> MessageBoard </h3>
        {messages.map((msg, i) => (<p key={i}> {msg.text} </p>))}
      </div>
    )
  }
}

export default connect(mapStateToProps, null)(MessageBoard)
