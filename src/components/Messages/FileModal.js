import React from 'react';
import {Modal, Input , Button,Icon} from 'semantic-ui-react';
import mime from 'mime-types';

class FileModal extends React.Component{
    state = {
        file: null,
        authorized: ['image/jpeg', 'image/png']
    }

    addFile = (e)=>{
        const file = e.target.files[0];
        // console.log(file);
        if(file){
            this.setState({
                file: file
            });
        }

    }   

    isAuthorized = (name)=> this.state.authorized.includes(mime.lookup(name));

    sendFile = ()=>{
        const {file} = this.state;
        const {uploadFile,closeModal} = this.props;
        // console.log("mime.lookup(name) ", mime.lookup(file.name));
        if(file !== null){
            if(this.isAuthorized(file.name)){
                const metadata = {contentType: mime.lookup(file.name)};
                uploadFile(file,metadata);
                closeModal();
                this.clearFile();
            }
        }
    }

    clearFile = ()=>{
        this.setState({
            file: null
        });
    }

    render(){
        const {modal, closeModal} = this.props;
        return(
            <Modal basic open={modal} onClose={closeModal}>
                <Modal.Header>
                    Select an image file
                </Modal.Header>
                <Modal.Content>
                    <Input 
                        onChange={this.addFile}
                        fluid
                        label="File type: jpg/png"
                        name="file"
                        type="file">
                    </Input>
                </Modal.Content>
                <Modal.Actions>
                    <Button color="green" inverted onClick={this.sendFile}>
                        <Icon name="checkmark" /> Send
                    </Button>
                    <Button color="red" inverted onClick={closeModal}> 
                        <Icon name="remove" /> Remove
                    </Button>
                </Modal.Actions>
            </Modal>
        );
    }
}

export default FileModal;