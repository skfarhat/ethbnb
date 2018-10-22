import React, { Component } from 'react'
import { connect } from "react-redux";
import log from "../logger"

const mapStateToProps = (state) => {
    return {
        messages: state.messages
    }
}

class Message extends Component {
    render() {
        return (<p> {this.props.msg.text} </p>)
    }
}

class MessageBoard_ extends Component {
    render() {
        log.debug('MessageBoard: render')
        let messages = []
        for (var i in this.props.messages) {
            let msg = this.props.messages[i]
            messages.push(<Message key={i} msg={msg} />)
        }
        return (
            <div id='message-board' className={this.props.bootstrapWidth}> 
                <h3> MessageBoard </h3>
                {messages}
            </div>
            )
    }
}

const MessageBoard = connect(mapStateToProps, null)(MessageBoard_)
export default MessageBoard