import React from 'react';
import {Header, Segment, Input, Icon} from 'semantic-ui-react';

class MessageHeader extends React.Component{

    render(){
        const {channelName,numUniqueUsers,handleSearchChanage,searchLoading,isPrivateChannel,
                isChannelStarred,handleStarred} = this.props;
        // console.log("channelname ", channelName);
        return(
            <Segment clearing>
                <Header fluid="true" as="h2" floated="left" style={{marginBottom: 0}}>
                    <span>
                        {channelName}
                        {!isPrivateChannel && <Icon 
                            onClick={handleStarred} 
                            name={isChannelStarred ? 'star' : 'star outline'} 
                            color={isChannelStarred ? 'yellow' : 'black'} />}
                    </span>
                    <Header.Subheader> 
                        {numUniqueUsers}
                    </Header.Subheader>
                </Header>
                <Header floated="right">
                    <Input
                            loading={searchLoading}
                            onChange={handleSearchChanage}
                            size="mini"
                            icon="search"
                            name="searchTerm"
                            placeholder="Search here"
                    >
                    </Input>
                </Header>
            </Segment>
        );
    };
}

export default MessageHeader;