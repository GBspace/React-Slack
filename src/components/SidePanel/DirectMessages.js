import React from 'react';
import firebase from '../../firebase';
import {Menu, Icon} from 'semantic-ui-react';
import {connect} from 'react-redux';
import {setCurrentChannel,setPrivateChannel} from '../../actions/index';


class DirectMessages extends React.Component{

    state = {
        users: [],
        user: this.props.currentUser,
        usersRef: firebase.database().ref('users'),
        users: [],
        connectedRef: firebase.database().ref('.info/connected'),
        presenceRef: firebase.database().ref('presence'),
        activeChannel: ''
        
    }

    componentDidMount(){
        if(this.state.user){
            this.addListeners(this.state.user.uid);
        }
    }

    componentWillUnmount(){
        this.removeListeners();
    }

    removeListeners = ()=>{
        this.state.usersRef.off();
        this.state.presenceRef.off();
        this.state.connectedRef.off();
    }

    addStatusToUsers = (userId, connected = true)=>{
        const updatedUsers = this.state.users.reduce((acc,user)=>{
            if(user.uid === userId){
                user['status'] = `${connected ? 'online' : 'offline'}`
            }
            return acc.concat(user);
        },[]);
        this.setState({
            users: updatedUsers
        });
    }

    addListeners = (currentUserUid)=>{
        let loadedUsers = [];
        this.state.usersRef.on('child_added', snap =>{
            // console.log("child_added ", snap.val());
            // console.log("currentUserUid ", currentUserUid , "snap.key " , snap.key);
            if(currentUserUid !== snap.key){
                // console.log("updating loadedusers");
                let user = snap.val();
                user['uid'] = snap.key;
                user['status'] = 'offline';
                loadedUsers.push(user);
                this.setState({
                    users: loadedUsers
                });
            }
            
        });
        // console.log("this.state.users " , this.state.users);

        this.state.connectedRef.on('value',snap=>{
            // console.log("this.state.connectedRef key ", snap.key , "value" , snap.val() );
            if(snap.val() === true){
                const ref = this.state.presenceRef.child(currentUserUid);
                ref.set(true);
                ref.onDisconnect().remove(err =>{
                    if(err !== null){
                        console.error(err);
                    }
                })
            }
        });
        this.state.presenceRef.on('child_added',snap =>{
            if(currentUserUid !== snap.key){
                this.addStatusToUsers(snap.key);
            }
        });

        this.state.presenceRef.on('child_removed',snap =>{
            if(currentUserUid !== snap.key){
                this.addStatusToUsers(snap.key,false);
            }
        });
    }

    isUserOnline = (user) => user.status === 'online';

    changeChannel = (user)=>{
        const channelId = this.getChannelId(user.uid);
        const channelData = {
            id: channelId,
            name: user.name
        };
        this.props.setCurrentChannel(channelData);
        this.props.setPrivateChannel(true);
        this.setActiveChannel(user.uid);
    };

    setActiveChannel = (userId)=>{
        this.setState({
            activeChannel: userId
        });
    };

    getChannelId = (userId)=>{
        const currentUserUid = this.state.user.uid;
        return userId < currentUserUid ? 
        `${userId}/${currentUserUid}` : `${currentUserUid}/${userId}`;
    }

    render(){
        const {users,activeChannel} = this.state;
        return(
            <Menu.Menu className="menu">
                <Menu.Item>
                    <span>
                        <Icon name="mail">DIRECT({ users.length })</Icon>
                    </span>
                </Menu.Item>
                {
                    users.map(user=>(
                        <Menu.Item
                            active={user.uid === activeChannel}
                            key={user.uid}
                            onClick={()=>{
                                this.changeChannel(user);
                            }}
                            style={{opacity: 0.7, fontStyle: 'italic'}}

                        >
                        <Icon
                            name="circle"
                            color={this.isUserOnline(user) ? 'green' : 'red'}
                        />

                        @{user.name}

                        </Menu.Item>
                    ))
                }
            </Menu.Menu>
        );
    };
};

const mapDispatchToProps = (dispatch)=>({
    setCurrentChannel:(channelData)=>{dispatch(setCurrentChannel(channelData))},
    setPrivateChannel: (isPrivateChannel)=>{dispatch(setPrivateChannel(isPrivateChannel))}
});


export default connect(undefined,mapDispatchToProps)(DirectMessages);