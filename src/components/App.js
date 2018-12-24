import React from 'react';
import {Grid} from 'semantic-ui-react';
import './App.css';
import {connect} from 'react-redux';

import MetaPanel from './MetaPanel/MetaPanel';
import Messages from './Messages/Messages';
import SidePanel from './SidePanel/SidePanel';
import ColorPanel from './ColorPanel/ColorPanel';

const App = (props)=>{
  const {currentUser, currentChannel} = props;

  // console.log(currentUser);
  // console.log(currentChannel);
  return(
    <Grid columns="equal" className="app" style={{background: '#eee'}}>
      <ColorPanel />
      <SidePanel currentUser = {currentUser} key={currentUser && currentUser.uid}/>
      <Grid.Column style={{marginLeft: 320}}>
        {
          currentChannel && 
          <Messages 
          key={currentChannel && currentChannel.currentChannel.id}
          currentChannel={currentChannel.currentChannel}
          currentUser = {currentUser}/>
        }
      </Grid.Column>
      
      <Grid.Column width={4}>
        <MetaPanel />  
      </Grid.Column>
    </Grid>
  );
}

const mapStateToProps = (state)=>({
  currentUser: state.user.currentUser,
  currentChannel: state.channel.currentChannel
});

export default connect(mapStateToProps)(App);
