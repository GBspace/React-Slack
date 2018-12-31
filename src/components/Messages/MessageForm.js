import React from 'react';
import {Segment,Button,Input} from 'semantic-ui-react';
import firebase from '../../firebase';
import FileModal from './FileModal';
import uuidv4 from 'uuid/v4';
import ProgressBar from './ProgressBar';

class MessageForm extends React.Component{
    state = {
        message:'',
        loading: false,
        channel: this.props.currentChannel,
        currentUser: this.props.currentUser,
        errors: [],
        modal: false,
        uploadState: '',
        uploadTask: null,
        storageRef: firebase.storage().ref(),
        percentUploaded: 0
    }

    openModal = ()=>{
        this.setState({
            modal:true
        });
    };
    closeModal = ()=>{
        this.setState({
            modal:false
        });
    }

    handleChange = (e)=>{
        e.preventDefault();
        // console.log("e.target.name ", e.target.name);
        // console.log("e.target.value ", e.target.value);
        this.setState({
            [e.target.name] : e.target.value
        });
    };

    createMessage = (fileUrl = null )=>{
        const {currentUser} = this.state;
        const messageObj = {
            // content: this.state.message,
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            user: {
                id: currentUser.uid,
                name: currentUser.displayName,
                avatar: currentUser.photoURL
            }
        };
        if(fileUrl !== null){
            messageObj['image'] = fileUrl;
        }else{
            messageObj['content'] = this.state.message;
        }

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

    uploadFile = (file,metadata)=>{
        // console.log(file);
        // console.log(metadata);
        const pathToUpload = this.state.channel.id;
        const ref = this.props.messagesRef;
        const filePath = `chat/public/${uuidv4()}.jpg`;

        this.setState(
            {
              uploadState: "uploading",
              uploadTask: this.state.storageRef.child(filePath).put(file, metadata)
            },
            () => {
              this.state.uploadTask.on(
                "state_changed",
                snap => {
                  const percentUploaded = Math.round(
                    (snap.bytesTransferred / snap.totalBytes) * 100
                  );
                  this.setState({ percentUploaded });
                },
                err => {
                  console.error(err);
                  this.setState({
                    errors: this.state.errors.concat(err),
                    uploadState: "error",
                    uploadTask: null
                  });
                },
                () => {
                  this.state.uploadTask.snapshot.ref
                    .getDownloadURL()
                    .then(downloadUrl => {
                      this.sendFileMessage(downloadUrl, ref, pathToUpload);
                    })
                    .catch(err => {
                      console.error(err);
                      this.setState({
                        errors: this.state.errors.concat(err),
                        uploadState: "error",
                        uploadTask: null
                      });
                    });
                }
              );
            }
          );
    };


    sendFileMessage = (fileUrl, ref,pathToUpload)=>{
        ref.child(pathToUpload).push().set(this.createMessage(fileUrl))
        .then(()=>{
            this.setState({
                uploadState: 'done'
            });
        })
        .catch((err)=>{
            console.error(err);
            this.setState({
                errors: this.state.errors.concat(err),
            });
        });
    }

    render(){
        const {errors, message,loading,modal, percentUploaded,uploadState} = this.state;
        // console.log(errors);
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
                        errors.some(error => error && error.message.toLowerCase().includes("message") ) ? "error" : ""
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
                        onClick={this.openModal}
                    />
                </Button.Group>
                    <FileModal 
                        modal={modal}
                        closeModal={this.closeModal}
                        uploadFile={this.uploadFile}
                    />
                    <ProgressBar 
                        uploadState={uploadState}
                        percentUploaded={percentUploaded}
                    />
                
            </Segment>
        );
    };
}

export default MessageForm;