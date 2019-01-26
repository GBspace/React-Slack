import React from 'react';
import {Menu,Icon} from 'semantic-ui-react';
import {connect} from 'react-redux';
import {setCurrentChannel,setPrivateChannel} from '../../actions';
import firebase from '../../firebase';

class Starred extends React.Component{

    state = {
        starredChannels: [],
        activeChannel: '',
        currentUser: this.props.currentUser,
        usersRef: firebase.database().ref('users')
    };

    componentDidMount(){
        if(this.state.currentUser){
            this.addListeners(this.state.currentUser.uid);
        }
        
    }

    componentWillUnmount(){
        this.removeListeners();
    }

    removeListeners = ()=>{
        this.state.usersRef.child(`${this.state.currentUser.uid}/starred`).off();
    }

    addListeners = (userId)=>{
        this.state.usersRef
        .child(userId)
        .child('starred')
        .on('child_added' , snap =>{
            const starredChannel = {id: snap.key, ...snap.val()};
            this.setState({
                starredChannels: [...this.state.starredChannels, starredChannel]
            });
        });

        this.state.usersRef
        .child(userId)
        .child('starred')
        .on('child_removed',snap=>{
            const channelToRemove = { id: snap.key, ...snap.val()};
            const filteredChannels = this.state.starredChannels.filter(channel=>{
                return channel.id !== channelToRemove.id;
            });
                        
            this.setState({
                starredChannels: filteredChannels
            });
        })
    };

    setActiveChannel = (channel)=>{
        // console.log("updating channel id");
        this.setState({
            activeChannel: channel.id
        });
    };

    displayChannels = (starredChannels)=>{
        return starredChannels.length > 0 && starredChannels.map((channel)=>(
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

    changeChannel = (channel)=>{
        // console.log("Changing channel");
        this.setActiveChannel(channel);
        
        this.props.setCurrentChannel(channel);
        this.props.setPrivateChannel(false);
       
    }



    render(){
        const {starredChannels} = this.state;
        return(
            <Menu.Menu style={{paddingBottom: '2em'}}>
                <Menu.Item>
                    <span>
                        <Icon name="star">STARRED({starredChannels.length})</Icon>
                    </span>

                    
                    
                </Menu.Item>
                {this.displayChannels(starredChannels)}
            </Menu.Menu>
        )
    }
}

const mapDispatchToProps = (dispatch)=>({
    setCurrentChannel: (channel)=>{dispatch(setCurrentChannel(channel))},
    setPrivateChannel: (isPrivateChannel)=>{dispatch(setPrivateChannel(isPrivateChannel))}
});

export default connect(undefined,mapDispatchToProps)(Starred);