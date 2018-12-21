import React from 'react';
import {Segment,Button,Input} from 'semantic-ui-react';

class MessageForm extends React.Component{
    state = {
        message:'',
        loading: false
    }

    handleChange = (e)=>{
        e.preventDefault();
        this.setState({
            [e.target.name] : e.target.value
        });
    };

    sendMessage = ()=>{
        const {messagesRef,currentChannel} = this.props;
        const {message} = this.state;
        
        if(message){
            this.setState({loading:true});
            // messagesRef.child(currentChannel.currentChannel.id)
        }
    }
    render(){

        console.log(this.props.currentChannel.id);
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
                />
                        
                <Button.Group icon widths="2">
                    <Button
                        onClick={this.sendMessage}
                        color="orange"
                        content="Add Reply"
                        labelPosition="left"
                        icon="edit"
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