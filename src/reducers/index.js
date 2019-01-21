import {combineReducers} from 'redux';

import * as actionTypes from '../actions/types';

const initialState = {
    currentUser: null,
    isLoading: true
};

const user_reducer = (state = initialState,action) => {
    switch(action.type) {
        case actionTypes.SET_USER: {
            return {
                currentUser: action.payload.currentUser,
                isLoading: false
            }
        }
        case actionTypes.CLEAR_USER: {
            return{
                ...state,
                isLoading: false

            }
        }

        default:
            return state;
    }
}

const initialChannelState = {
    currentChannel: null,
    isPrivateChannel: false,
    usersPosts: null
};

const channel_reducer = (state = initialChannelState,action) =>{
    
    switch(action.type){
        case actionTypes.SET_CURRENT_CHANNEL: {
            // console.log("action payload ", action.payload.currentChannel);
            return({
                ...state,
                currentChannel: action.payload
            });

        }
        
        case actionTypes.SET_PRIVATE_CHANNEL:{
            // console.log("action payload ", action.payload.isPrivateChannel);
            return({
                ...state,
                isPrivateChannel: action.payload.isPrivateChannel
            });
        }

        case actionTypes.SET_USER_POSTS : {
            
            return ({
                ...state,
                usersPosts: action.payload.usersPosts
            });
        }

        default: 
            return state;
    }
}

const initialColorState = {
    primaryColor: '#4c3c4c',
    secondaryColor: '#eee'
}

const color_reducer = (state = initialColorState , action)=>{
    // console.log(action);
    switch(action.type) {
        case actionTypes.SET_COLORS : 
            return {
                primaryColor: action.payload.primaryColor,
                secondaryColor: action.payload.secondaryColor
            }
        

        default: 
            return state;
    }
}

const rootReducer = combineReducers({
    user: user_reducer,
    channel: channel_reducer,
    colors: color_reducer
});



export default rootReducer;