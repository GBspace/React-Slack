import React from 'react';
import {Segment,Comment} from 'semantic-ui-react';
import MessagesHeader from './MessagesHeader';
import MessageForm from './MessageForm';
import Message from './Message';
import firebase from '../../firebase';


class Messages extends React.Component{

    state = {
        messagesRef: firebase.database().ref('messages'),
        channel: this.props.currentChannel,
        currentUser: this.props.currentUser,
        messages: [],
        messagesLoading: true  
    };

    componentDidMount(){
        const {channel,currentUser} = this.state;
        if(channel && currentUser){
            this.addListeners(channel.id);   
        }
    };

    addListeners = (channelId)=>{
        this.addMessageListener(channelId);

    };

    addMessageListener = (channelId)=>{
        let loadedMessages = [];
        this.state.messagesRef.child(channelId).on('child_added',snap=>{
            loadedMessages.push(snap.val());
            // console.log("loaded messages " , loadedMessages);
            this.setState({
                messages: loadedMessages,
                messagesLoading: false
            });
        })
    };

    

    displayMessages = (messages)=>{
        if (messages.length > 0 ){
         console.log("messages " , messages);
         <Message messages = {messages} />
           
        };
    };

    render(){
        const {messagesRef,channel,currentUser,messages} = this.state;
        // const {currentChannel} = this.props;
        
        return(
            <React.Fragment>
                <MessagesHeader/>

                <Segment>
                    <Comment.Group className="messages">
                        {this.displayMessages(messages)}
                    </Comment.Group>
                </Segment>
                <MessageForm 
                    messagesRef = {messagesRef} 
                    currentChannel={channel} 
                    currentUser={currentUser}/>
            </React.Fragment>
        )
    };
}

export default Messages;