import React from 'react';
import firebase from '../../firebase';
import AvatarEditor from 'react-avatar-editor';

import { Grid, Header, Icon, Dropdown, Image , Modal, Input,Button} from 'semantic-ui-react';

class UserPanel extends React.Component{

    state = {
        user: this.props.currentUser,
        modal: false,
        previewImage: '',
        blob:'',
        croppedImage:'',
        storageRef: firebase.storage().ref(),
        userRef: firebase.auth().currentUser,
        metadata: {
            contentType: 'image/jpeg'
        },
        uploadedCroppedImage:'',
        usersRef: firebase.database().ref('users')
    }

    openModal =()=>this.setState({modal: true});

    closeModal =()=>this.setState({modal: false});

    dropdownOptions = ()=>
        [{
            key: 'user',
            text: <span> Signed in as <strong>{this.state.user.displayName}</strong></span>,
            disabled: true
        },
        {
            key: 'avatar',
            text: <span onClick = {this.openModal}>Change Avatar</span>
        },
        {
            key: 'signout',
            text: <span onClick={this.handleSignOut}>Sign Out</span>
        }]
    
    handleSignOut = (e)=>{
        e.preventDefault();
        firebase.auth().signOut().then(()=>{
            console.log("signed out");
        });
    };

    handleChange = (e)=>{
        const file = e.target.files[0];
        const reader = new FileReader();
        if(file){
            reader.readAsDataURL(file);
            reader.addEventListener('load',()=>{
                this.setState({
                    previewImage: reader.result
                });
            });
        }
    }

    handleCroppedImage = ()=>{
        if(this.avatarEditor){
            this.avatarEditor.getImageScaledToCanvas().toBlob(blob => {
                let imageUrl = URL.createObjectURL(blob);
                this.setState({
                    croppedImage: imageUrl,
                    blob
                });
            });
        }
    }


    uploadCroppedImage = ()=>{
        const {storageRef,userRef,blob,metadata} = this.state;
        storageRef.child(`avatar/users/${userRef.uid}`)
        .put(blob,metadata)
        .then(snap => {
            snap.ref.getDownloadURL().then(getDownloadURL => {
                this.setState({uploadedCroppedImage: getDownloadURL},()=>
                    this.changeAvatar()
                );
            })
        });
    }

    changeAvatar = ()=>{
        this.state.userRef
        .updateProfile({
            photoURL: this.state.uploadedCroppedImage
        }).then(()=>{
            console.log('Photo URL updated');
            this.closeModal();
        }).catch(err=>console.error(err));


        this.state.usersRef.child(this.state.user.uid)
        .update({avatar: this.state.uploadedCroppedImage})
        .then(()=>{
            console.log("user avatar updated");
        }).catch((err)=>{
            console.error(err);
        });
    }

    render(){
        const {primaryColor} = this.props;
        const {modal,previewImage,croppedImage} = this.state;
        return(
            <Grid style={{background: primaryColor}}>
                <Grid.Column>
                    <Grid.Row style={{padding: '1.2em', margin: 0}}>
                        {/* {Application Header} */}
                        <Header inverted floated="left" as="h2">
                            <Icon name="code"></Icon>
                            <Header.Content>
                                Chat
                            </Header.Content>
                        </Header>
                    
                        {/* User Dropdown */}
                        <Header style={{padding: '0.25em'}} as="h4" inverted>
                            <Dropdown trigger={
                                <span>
                                    <Image src={this.state.user.photoURL} spaced="right" avatar />
                                    {this.state.user.displayName}
                                </span>
                            } options={
                                this.dropdownOptions()
                            } />
                        </Header>
                    </Grid.Row>
                    <Modal basic open={modal} onClose={this.closeModal}>
                        <Modal.Header>Change Avatar</Modal.Header>
                        <Modal.Content>
                            <Input 
                                fuild="true"
                                type="file"
                                label="New Avatar"
                                name="previewImage"
                                onChange={this.handleChange}
                                />
                            <Grid center="true" stackable columns={2}>
                                <Grid.Row centered>
                                    <Grid.Column className="ui centered aligned grid">
                                        {
                                            previewImage && (
                                                <AvatarEditor
                                                    ref={node=>(this.avatarEditor=node)}
                                                    image={previewImage}
                                                    width={120}
                                                    height={120}
                                                    border={50}
                                                    scale={1.2}
                                                />
                                            )
                                        }
                                    </Grid.Column>
                                    <Grid.Column className="ui centered aligned grid">
                                        {croppedImage && (
                                            <Image 
                                                style={{margin: '3.5em auto'}}
                                                width={100}
                                                height={100}
                                                src={croppedImage}
                                                >

                                            </Image>
                                        )}
                                    </Grid.Column>
                                </Grid.Row>
                            </Grid>
                        </Modal.Content>
                        <Modal.Actions>
                            {croppedImage && <Button color="green" inverted onClick={this.uploadCroppedImage}>
                                <Icon name="save"/> Change Avatar 
                            </Button>}
                            <Button color="green" inverted onClick={this.handleCroppedImage}>
                                <Icon name="image"/> Preview
                            </Button>
                            <Button color="red" inverted onClick={this.closeModal}>
                                <Icon name="remove"/> Cancel
                            </Button>
                        </Modal.Actions>
                    </Modal>
                </Grid.Column>
            </Grid>
        );
    };
}




export default UserPanel;