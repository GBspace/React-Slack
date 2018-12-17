import React from 'react';
import ReactDOM from 'react-dom';

import App from './components/App';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import registerServiceWorker from './registerServiceWorker';
import firebase from 'firebase';
import {createStore} from 'redux';
import {Provider,connect} from 'react-redux';
import {composeWithDevTools} from 'redux-devtools-extension';
import rootReducer from './reducers/index';
import 'semantic-ui-css/semantic.min.css';
import {setUser} from './actions/index';

import {BrowserRouter as Router, Switch, Route, withRouter} from 'react-router-dom';


const store = createStore(rootReducer, composeWithDevTools());

class Root extends React.Component {
    componentDidMount(){
        
        firebase.auth().onAuthStateChanged((user)=>{
           if(user){
            // console.log("Index.app mounting ", user);
            this.props.setUser(user);
                this.props.history.push('/');
           } 
        });
    }

    render(){
        console.log("Props " , this.props);
        return(
            <Switch>
                <Route path="/" component={App} exact/>
                <Route path="/login" component={Login} />
                <Route path="/register" component={Register} />
            </Switch>
        )
    }
   
}

const mapDispatchToProps = (dispatch)=>({
    setUser: (user)=>{dispatch(setUser(user))}
});

const connectedRoot = connect(null,mapDispatchToProps)(Root);
const RootWithAuth = withRouter(connectedRoot);

ReactDOM.render(
    <Provider store={store}>
        <Router>
            <RootWithAuth/>
        </Router>
    </Provider>
, document.getElementById('root'));
registerServiceWorker();
