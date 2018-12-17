import React from 'react';
import {Grid} from 'semantic-ui-react';
import './App.css';
import {connect} from 'react-redux';

import MetaPanel from './MetaPanel/MetaPanel';
import Messages from './Messages/Messages';
import SidePanel from './SidePanel/SidePanel';
import ColorPanel from './ColorPanel/ColorPanel';

const App = (props)=>{
  // const {currentUser} = props.currentUser;
  // console.log(currentUser);
  return(
    <Grid columns="equal" className="app" style={{background: '#eee'}}>
      <ColorPanel />
      <SidePanel currentUser = { props.currentUser}/>
      <Grid.Column style={{marginLeft: 320}}>
        <Messages />
      </Grid.Column>
      
      <Grid.Column width={4}>
        <MetaPanel />  
      </Grid.Column>
    </Grid>
  );
}

const mapStateToProps = (state)=>({
  currentUser: state.user.currentUser
});

export default connect(mapStateToProps)(App);
