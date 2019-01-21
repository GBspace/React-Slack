import React from 'react';
import {Grid} from 'semantic-ui-react';
import './App.css';
import {connect} from 'react-redux';

import MetaPanel from './MetaPanel/MetaPanel';
import Messages from './Messages/Messages';
import SidePanel from './SidePanel/SidePanel';
import ColorPanel from './ColorPanel/ColorPanel';

const App = (props)=>{
  const {currentUser, currentChannel,isPrivateChannel,
      usersPosts, primaryColor,secondaryColor} = props;

  // console.log("usersPosts " , usersPosts);
  // console.log(currentChannel);
  return(
    <Grid columns="equal" className="app" style={{background: secondaryColor}}>
      <ColorPanel 
        key={currentUser && currentUser.name}
        currentUser={currentUser}/>
      <SidePanel 
        currentUser = {currentUser} 
        primaryColor={primaryColor}
        key={currentUser && currentUser.uid}/>
      <Grid.Column style={{marginLeft: 320}}>
        {
          currentChannel && 
          <Messages 
          key={currentChannel && currentChannel.currentChannel.id}
          currentChannel={currentChannel.currentChannel}
          currentUser = {currentUser}
          isPrivateChannel={isPrivateChannel}/>
        }
      </Grid.Column>
      
      <Grid.Column width={4}>
      { currentChannel &&  
        <MetaPanel 
          key={currentChannel && currentChannel.currentChannel.name}
          isPrivateChannel={isPrivateChannel}
          currentChannel={currentChannel && currentChannel.currentChannel}
          usersPosts={usersPosts}
        />  
      }
      </Grid.Column>
    </Grid>
  );
}

const mapStateToProps = (state)=>({
  currentUser: state.user.currentUser,
  currentChannel: state.channel.currentChannel,
  isPrivateChannel: state.channel.isPrivateChannel,
  usersPosts: state.channel.usersPosts,
  primaryColor: state.colors.primaryColor,
  secondaryColor: state.colors.secondaryColor
});

export default connect(mapStateToProps)(App);
