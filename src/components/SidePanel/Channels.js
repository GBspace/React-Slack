import React from 'react';
import {Menu, Icon, Modal, Form, Input,Button} from 'semantic-ui-react';
import firebase from '../../firebase';
import {connect} from 'react-redux';
import {setCurrentChannel,setPrivateChannel} from '../../actions/index';

class Channels extends React.Component{

    state = {
        channels: [],
        modal: false,
        channelName: '',
        channelDetails: '',
        channelsRef: firebase.database().ref('channels'),
        user: this.props.currentUser,
        firstLoad: true,
        activeChannel: null
    };

    componentDidMount(){
        this.addListeners();
    }

    componentWillUnmount(){
        this.removeListeners();
    };

    removeListeners = ()=>{
        this.state.channelsRef.off();
    };

    addListeners = ()=>{
        let loadedChannels = [];
        this.state.channelsRef.on('child_added',snap =>{
            loadedChannels.push(snap.val());
            // console.log(loadedChannels);
            this.setState({channels: loadedChannels},()=>{
                this.setFirstChannel();
            });

        })
    };

    setFirstChannel = ()=>{
        const firstChannel = this.state.channels[0];
        
        if(this.state.firstLoad && this.state.channels.length > 0){
            this.props.setCurrentChannel(firstChannel);
            this.setActiveChannel(firstChannel);
        };

        this.setState({
            firstLoad: false
        });
    };

    closeModal = ()=>{
        this.setState({
            modal: false
        });
    };

    openModal = ()=>{
        this.setState({
            modal: true
        });
    };

    handleChange = (e)=>{
        e.preventDefault();
        this.setState({
            [e.target.name] : e.target.value
        });
    }

    addChannel = ()=>{
        const {channelsRef,channelDetails,channelName,user} = this.state;
        // console.log("channelsRef ", channelsRef);
        const key = channelsRef.push().key;
        // console.log("key is ", key);
        const newChannel = {
            id: key,
            name: channelName,
            details: channelDetails,
            createdBy: {
                name: user.displayName,
                avatar: user.photoURL
            }
        };
        channelsRef.child(key).update(newChannel).then(()=>{
            this.setState({
                channelName: '',
                channelDetails: ''
            });
            this.closeModal();
            console.log("New channel added to firebase");
        })
        .catch(err => 
            console.log("Error in adding a channel ", err));
    }

    handleSubmit=(e)=>{
        e.preventDefault();
        if(this.isFormValid(this.state)){
            this.addChannel();
        }
    }

    isFormValid = ({channelName,channelDetails}) => channelName && channelDetails;
    
    setActiveChannel = (channel)=>{
        // console.log("updating channel id");
        this.setState({
            activeChannel: channel.id
        });
    };

    changeChannel = (channel)=>{
        // console.log("Changing channel");
        this.setActiveChannel(channel);
        this.props.setCurrentChannel(channel);
        this.props.setPrivateChannel(false);
        
    }

    

    displayChannels = (channels)=>{
       return channels.length > 0 && channels.map((channel)=>(
            <Menu.Item
                key={channel.id}
                onClick={()=>this.changeChannel(channel)}
                name={channel.name}
                style={{opacity : 0.7}}
                active={channel.id === this.state.activeChannel}>
            # {channel.name}
            </Menu.Item>
        ));
    };

    render(){
        const {channels,modal} = this.state;
        return(
            <React.Fragment>
                <Menu.Menu style={{paddingBottom: '2em'}}>
                    <Menu.Item>
                        <span>
                            <Icon name="exchange">CHANNELS({channels.length}) </Icon>
                        </span>

                        
                        <Icon name="add" onClick={this.openModal}/>
                    </Menu.Item>
                    {this.displayChannels(channels)}
                </Menu.Menu>

                {/* Add Channel Modal */}
                <Modal basic open={modal} onClose={this.closeModal}>
                    <Modal.Header>Add a Channel </Modal.Header>
                    <Modal.Content>
                        <Form onSubmit={this.handleSubmit}>
                            <Form.Field>
                                <Input
                                    fluid
                                    label="Name of Channel"
                                    name="channelName"
                                    onChange={this.handleChange}>
                                
                                </Input>
                            </Form.Field>
                            <Form.Field>
                                <Input
                                    fluid
                                    label="About the Channel"
                                    name="channelDetails"
                                    onChange={this.handleChange}>
                                
                                </Input>
                            </Form.Field>
                        </Form>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button color="green" inverted>
                            <Icon name="checkmark" onClick={this.handleSubmit}>
                                Add
                            </Icon>
                        </Button>
                        <Button color="red" inverted>
                            <Icon name="remove" onClick={this.closeModal}>
                                Cancel
                            </Icon>
                        </Button>
                    </Modal.Actions>
                </Modal>
            </React.Fragment>
        );
    };
}

const mapDispatchToProps = (dispatch)=>({
    setCurrentChannel: (channel)=>{dispatch(setCurrentChannel(channel))},
    setPrivateChannel: (isPrivateChannel)=>{dispatch(setPrivateChannel(isPrivateChannel))}
});

export default connect(undefined,mapDispatchToProps)(Channels);