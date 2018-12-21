import React from 'react';
import {Segment,Comment} from 'semantic-ui-react';
import MessagesHeader from './MessagesHeader';
import MessageForm from './MessageForm';
import firebase from '../../firebase';

class Messages extends React.Component{

    state = {
        messagesRef: firebase.database().ref('messages')
    };

    render(){
        const {messagesRef } = this.state;
        const {currentChannel} = this.props;
        
        return(
            <React.Fragment>
                <MessagesHeader/>

                <Segment>
                    <Comment.Group className="messages">
                        {/* Messages */}
                    </Comment.Group>
                </Segment>
                <MessageForm messagesRef = {messagesRef} currentChannel={currentChannel}/>
            </React.Fragment>
        )
    };
}

export default Messages;