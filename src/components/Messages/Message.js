import React from 'react';

class Message extends React.Component{
    render(){
        console.log("printing messages");
        const {messages} = this.props;
        return(
            <div>
                {messages}
            </div>
        );
    };
}   

export default Message ;