import React from 'react';
import {Segment,Button,Input} from 'semantic-ui-react';
import firebase from '../../firebase';

class MessageForm extends React.Component{
    state = {
        message:'',
        loading: false,
        channel: this.props.currentChannel,
        currentUser: this.props.currentUser,
        errors: []
    }

    handleChange = (e)=>{
        e.preventDefault();
        // console.log("e.target.name ", e.target.name);
        // console.log("e.target.value ", e.target.value);
        this.setState({
            [e.target.name] : e.target.value
        });
    };

    createMessage = ()=>{
        const {currentUser} = this.state;
        const messageObj = {
            content: this.state.message,
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            user: {
                id: currentUser.uid,
                name: currentUser.displayName,
                avatar: currentUser.photoURL
            }
        };
        return messageObj;
    };

    sendMessage = ()=>{
        const {messagesRef} = this.props;
        const {message,channel} = this.state;
        // console.log("channel id " ,channel.id);
        // console.log("messageRef ", messagesRef);
        // console.log("message " , message);
        if(message){
            this.setState({loading:true});
            messagesRef
            .child(channel.id)
            .push()
            .set(this.createMessage())
            .then(()=>{
                this.setState({
                    loading: false,
                    message: '',
                    errors: []
                });
            })
            .catch((err)=>{
                console.log(err);
                this.setState({
                    errors: this.state.errors.concat(err),
                    loading: false
                });
            })
        }else{
            this.setState({
               errors: this.state.errors.concat({
                   message: 'Add a message'
               }) 
            });
        }
    }


    render(){
        const {errors, message,loading} = this.state;
        return(
            <Segment className="message__form">
                <Input
                    fluid
                    name="message"
                    style={{marginBottom: '0.7em'}}
                    label={<Button icon={'add'}/>}
                    labelPosition="left"
                    placeholder="messsage goes here"
                    onChange={this.handleChange}
                    className={
                        errors.some(error => error.message.toLowerCase().includes("message") ) ? "error" : ""
                    }
                    value={message}
                />
                        
                <Button.Group icon widths="2">
                    <Button
                        onClick={this.sendMessage}
                        color="orange"
                        content="Add Reply"
                        labelPosition="left"
                        icon="edit"
                        disabled={loading}
                    />
                    <Button
                        color="teal"
                        content="Upload Media"
                        labelPosition="right"
                        icon="cloud upload"
                    />
                </Button.Group>
            </Segment>
        );
    };
}

export default MessageForm;