import React from 'react';
import {Segment,Comment} from 'semantic-ui-react';
import MessagesHeader from './MessagesHeader';
import MessageForm from './MessageForm';
import Message from './Message';
import firebase from '../../firebase';
import {setUserPosts} from '../../actions/index';
import {connect} from 'react-redux';


class Messages extends React.Component{

    state = {
        messagesRef: firebase.database().ref('messages'),
        channel: this.props.currentChannel,
        currentUser: this.props.currentUser,
        messages: [],
        messagesLoading: true,
        numUniqueUsers: '',
        searchTerm: undefined,
        searchLoading: false,
        searchResults: [],
        isPrivateChannel: this.props.isPrivateChannel,
        privateMessagesRef: firebase.database().ref('privateMessages'),
        isChannelStarred: false,
        usersRef: firebase.database().ref('users')
    };

    componentDidMount(){
        const {channel,currentUser} = this.state;
        if(channel && currentUser){
            this.addListeners(channel.id);   
            this.addUsersStarredListeners(channel.id, currentUser.uid);
        }
    };

    handleStarred = ()=>{
        this.setState(prevState =>({
            isChannelStarred : !prevState.isChannelStarred
        }),()=>this.starChannel());
    }

    starChannel = ()=>{
        // console.log("this.state.currentUser ", this.state.currentUser);
        if(this.state.isChannelStarred){
            this.state.usersRef
            .child(`${this.state.currentUser.uid}/starred`)
            .update({
                [this.state.channel.id]: {
                    name: this.state.channel.name,
                    details: this.state.channel.details,
                    createdBy: {
                        name: this.state.channel.createdBy.name,
                        avatar: this.state.channel.createdBy.avatar,
                    }
                }
            })
        }else{
            this.state.usersRef
            .child(`${this.state.currentUser.uid}/starred`)
            .child(this.state.channel.id)
            .remove(err=>{
                (err !== null) && console.error(err);
            });
        }
    }

    addUsersStarredListeners = (channelId, currentUserUid)=>{
        this.state.usersRef
        .child(currentUserUid)
        .child('starred')
        .once('value')
        .then(data =>{
            if(data.val() !== null){
                const channelIds = Object.keys(data.val());
                const prevStarred = channelIds.includes(channelId);
                this.setState({
                    isChannelStarred: prevStarred
                });
            }
        });
    }

    addListeners = (channelId)=>{
        this.addMessageListener(channelId);

    };

    addMessageListener = (channelId)=>{
        let loadedMessages = [];
        const ref = this.getMessagesRef();
        ref.child(channelId).on('child_added',snap=>{
            loadedMessages.push(snap.val());
            // console.log("loaded messages " , loadedMessages);
            this.setState({
                messages: loadedMessages,
                messagesLoading: false
            });
        // console.log("loaded messges ", loadedMessages);
        this.countUniqueUsers(loadedMessages);
        this.countUserPosts(loadedMessages);
        });
        if(loadedMessages.length === 0){
            this.countUserPosts([]);
        }
        

    };

    countUserPosts = (messages)=>{
        let userPosts = messages.reduce((acc,message)=>{
            if(message.user.name in acc){
                acc[message.user.name].count += 1;
            }else{
                acc[message.user.name] = {
                    avatar: message.user.avatar,
                    count: 1
                };
            }
            return acc;
        },{});
        // console.log("updating redux " , userPosts);
        this.props.setUserPosts(userPosts);
    }

    countUniqueUsers = (messages)=>{
        const uniqueUsers = messages.reduce((acc,message)=>{
            if(!acc.includes(message.user.name)){
                acc.push(message.user.name);
            }
            return acc;
        },[]);
        const plural = uniqueUsers.length > 1 || uniqueUsers === 0;
        const numUniqueUsers = `${uniqueUsers.length} user${plural ? "s" : ""}`;
        this.setState({
            numUniqueUsers
        });
    }
    

    displayMessages = (messages)=>{
        return messages.map((msg)=>{
            return(
                <Message 
                    key={msg.timestamp} 
                    message={msg}
                    user={this.state.currentUser} >
                </Message>
            );
        });
    };
        
    

    handleSearchChanage = e =>{
        this.setState({
            searchTerm: e.target.value,
            searchLoading:true
        },()=> this.handleSearchMessages());
    };

    handleSearchMessages = ()=>{
        const channelMessages = [...this.state.messages];
        const regex = new RegExp(this.state.searchTerm, 'gi');
        const searchResults=channelMessages.reduce((accumulator,message)=>{
            // console.log(message.user.name);
            if((message.content && message.content.match(regex)) || 
                (message.user.name && message.user.name.match(regex))
                )
            {
                accumulator.push(message);
            }
            return accumulator;
        },[]);
        this.setState({
            searchResults
        });
        setTimeout(this.setState({
            searchLoading: false
        }), 1000);
    }

    displayChannelName = () => {
        // return (this.state.channel ? `${this.state.channel.name}` : '')
        return (this.state.channel)
        ? `${this.state.isPrivateChannel ? '@' : '#' }${this.state.channel.name}`
        : '';
    };

    getMessagesRef = ()=>{
        const {messagesRef,privateMessagesRef,isPrivateChannel} = this.state;
        return isPrivateChannel ? privateMessagesRef : messagesRef;  
    };

    render(){
        const {messagesRef,channel,currentUser,messages,numUniqueUsers,searchResults,
            searchLoading,isPrivateChannel, isChannelStarred} = this.state;
        // const {currentChannel} = this.props;
        // let msgs = searchResults ? searchResults : messages;
        // console.log("messages " , messages);
        return(
            <React.Fragment>
                <MessagesHeader 
                    channelName={this.state.channel.name}
                    numUniqueUsers={numUniqueUsers}
                    handleSearchChanage={this.handleSearchChanage}
                    searchLoading={searchLoading}
                    isPrivateChannel={isPrivateChannel}
                    isChannelStarred={isChannelStarred}
                    handleStarred={this.handleStarred}
                />

                <Segment>
                    <Comment.Group className="messages">
                        {  
                            searchResults.length > 0 ? 
                            this.displayMessages(searchResults): 
                            (messages.length > 0 ) && 
                            this.displayMessages(messages)
                        }
                    </Comment.Group>
                </Segment>
                <MessageForm 
                    messagesRef={messagesRef} 
                    currentChannel={channel} 
                    currentUser={currentUser}
                    isPrivateChannel={isPrivateChannel}
                    getMessagesRef={this.getMessagesRef}/>
            </React.Fragment>
        )
    };
}

const mapDispatchToProps = (dispatch)=>({
    setUserPosts: (userPosts)=>{dispatch(setUserPosts(userPosts))}
});

export default connect(undefined, mapDispatchToProps)(Messages);