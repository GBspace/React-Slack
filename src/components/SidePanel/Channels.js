import React from 'react';
import {Menu, Icon, Modal, Form, Input,Button, Label} from 'semantic-ui-react';
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
        activeChannel: null,
        channel: null,
        messagesRef: firebase.database().ref('messages'),
        notifications: []
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
            this.addNotificationListener(snap.key);

        })
    };

    addNotificationListener = channelId =>{
        this.state.messagesRef.child(channelId).on('value',snap =>{
            if(this.state.channel){
                this.handleNotifications(channelId, this.state.channel.id, 
                    this.state.notifications,snap);
            }
        });
    };

    handleNotifications = (channelId, currentChannelId, notifications, snap)=>{
        let lastTotal = 0;
        let index = notifications.findIndex(notification => notification.id === channelId);
        if(index !== -1){
            if(channelId !== currentChannelId){
                lastTotal = notifications[index].total;
                if(snap.numChildren() - lastTotal > 0){
                    notifications[index].count = snap.numChildren() - lastTotal;
                }
            }
            notifications[index].lastKnownTotal = snap.numChildren();
        }else{
            notifications.push({
                id: channelId,
                total: snap.numChildren(),
                lastKnownTotal: snap.numChildren(),
                count: 0
            });
        }

        this.setState({
            notifications
        });

    }

    setFirstChannel = ()=>{
        const firstChannel = this.state.channels[0];
        
        if(this.state.firstLoad && this.state.channels.length > 0){
            this.props.setCurrentChannel(firstChannel);
            this.setActiveChannel(firstChannel);
            this.setState({
                channel: firstChannel
            });
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
        this.clearNotifications();
        this.props.setCurrentChannel(channel);
        this.props.setPrivateChannel(false);
        this.setState({
            channel
        });
        
    }

    clearNotifications = ()=>{
        let index = this.state.notifications.findIndex(
            notification => notification.id === this.state.channel.id
        );

        if(index !== -1){
            let updatedNotifications = [...this.state.notifications];
            updatedNotifications[index].total = this.state.notifications[index].lastKnownTotal;
            updatedNotifications[index].count = 0;
            this.setState({
                notifications: updatedNotifications
            });
        }
    }

    displayChannels = (channels)=>{
       return channels.length > 0 && channels.map((channel)=>(
            <Menu.Item
                key={channel.id}
                onClick={()=>this.changeChannel(channel)}
                name={channel.name}
                style={{opacity : 0.7}}
                active={channel.id === this.state.activeChannel}>
                {this.getNotificationCount(channel) && (
                    <Label color="red">{this.getNotificationCount(channel)}</Label>
                )}
            # {channel.name}
            </Menu.Item>
        ));
    };

    getNotificationCount = (channel)=>{
        let count = 0;
        this.state.notifications.forEach(notification => {
            if(notification.id === channel.id){
                count = notification.count;
            }   
        });
        if(count > 0){
            return count;
        }
    }

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