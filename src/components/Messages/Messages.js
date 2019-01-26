import React from 'react';
import {Segment,Comment} from 'semantic-ui-react';
import MessagesHeader from './MessagesHeader';
import MessageForm from './MessageForm';
import Message from './Message';
import firebase from '../../firebase';
import {setUserPosts} from '../../actions/index';
import {connect} from 'react-redux';
import Typing from './Typing';



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
        usersRef: firebase.database().ref('users'),
        typingRef: firebase.database().ref('typing'),
        typingUsers: [],
        connectedRef: firebase.database().ref('.info/connected'),
        listeners: []
    };

    componentDidMount(){
        const {channel,currentUser,listeners} = this.state;
        if(channel && currentUser){
            this.removeListeners(listeners);
            this.addListeners(channel.id);   
            this.addUsersStarredListeners(channel.id, currentUser.uid);
        }
    };

    // componentWillUnmount(){
    //     this.removeListeners(this.state.listeners);
    //     this.state.connectedRef.off();

    // }

    removeListeners = (listeners)=>{
        listeners.forEach(listener =>{
            listener.ref.child(listener.id).off(listener.event);
        });
    }

    addToListeners = (id,ref,event)=>{
        const index = this.state.listeners.findIndex(listener => {
            return listener.id === id && listener.ref === ref && listener.event === event;
        });

        if(index === -1){
            const newListener = {id, ref, event};
            this.setState({
                listeners: this.state.listeners.concat(newListener)
            });
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
        this.addTypingListeners(channelId);

    };

    addTypingListeners = (channelId)=>{
        let typingUsers = [];
        this.state.typingRef.child(channelId).on('child_added',snap=>{
            // console.log("snap value ", snap);
            if(snap.key !== this.state.currentUser.uid){
                typingUsers = typingUsers.concat({
                    id: snap.key,
                    name: snap.val()
                });
             this.setState({typingUsers})   
            }
        });

        this.addToListeners(channelId, this.state.typingRef, 'child_added');

        this.state.typingRef.child(channelId).on('child_removed', snap =>{
            const index = typingUsers.findIndex(user => user.id === snap.key);
            if(index !== -1){
                typingUsers = typingUsers.filter(user=>user.id !== snap.key);
                this.setState({typingUsers});
            }
        });

        this.addToListeners(channelId, this.state.typingRef, 'child_removed');

        this.state.connectedRef.on('value', snap=>{
            if(snap.val() === true){
                this.state.typingRef
                .child(channelId)
                .child(this.state.currentUser.uid)
                .onDisconnect()
                .remove(err =>{
                    if(err !== null){
                        console.error(err);
                    }
                })
            }
        })

       
    }

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
        this.addToListeners(channelId, ref, 'child_added');        
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

    displayTypingUsers = (users)=>{
        // console.log("Typing user ", users);
       return users.length > 0 && users.map(user => (
            <div 
                style={{display : 'flex', alignItems: 'center' , marginBottom : '0.2em'}}
                key={user.uid}>
                    <span className="user__typing">{user.name} is typing </span> <Typing/>
            </div> 
        ));
    };

    render(){
        const {messagesRef,channel,currentUser,messages,numUniqueUsers,searchResults,
            searchLoading,isPrivateChannel, isChannelStarred,typingUsers} = this.state;
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
                        {this.displayTypingUsers(typingUsers)}
                        
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