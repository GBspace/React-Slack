import React from 'react';
import {Segment, Accordion, Header,Icon , Image,List} from 'semantic-ui-react';

class MetaPanel extends React.Component{

    state = {
        activeIndex: 0,
        isPrivateChannel: this.props.isPrivateChannel,
        currentChannel: this.props.currentChannel,
        // usersPosts: this.props.usersPosts
        
    }

    setActiveIndex = (event,titleProps)=>{
        const {index} = titleProps;
        const {activeIndex} = this.state;
        const newIndex = activeIndex === index ? -1 : index;
        this.setState({
            activeIndex: newIndex
        });
    }

    formatCount = (num)=>{
        return (num > 1 || num === 0) ? `${num} posts` : `${num} post`
    }

    displayTopPosters = (usersPosts)=>{
        // console.log("usersPosts metaPanel ", usersPosts);
        const postList =  Object.entries(usersPosts)
                .sort((a,b)=>
                    b[1].count - a[1].count
                )
                .map(([key,val],i)=>{
                    // if(key !== undefined){
                        return (
                            <List.Item key={i}>
                                <Image avatar src={val.avatar}/>
                                <List.Content> 
                                    <List.Header as="a">
                                        {key}
                                    </List.Header>
                                    <List.Description>
                                        {this.formatCount(val.count)}
                                    </List.Description>
                                </List.Content>
                            </List.Item>
                        )
                    // }
                });
        // console.log("sorted list ", postList);
        return postList;
    };

    render(){
        const {activeIndex,isPrivateChannel,currentChannel} = this.state;
        // console.log("state " , this.state);
        // console.log("props ", this.props);
        if(this.props.isPrivateChannel){
            return null;
        }

        return(
            <Segment>
                <Header as="h3" attached="top">
                    About #{currentChannel.name}
                </Header>
                <Accordion styled attached="true">
                    <Accordion.Title
                        active={activeIndex === 0}
                        index={0}
                        onClick={this.setActiveIndex}
                    >
                    <Icon name="dropdown" />
                    <Icon name="info" />
                        Channel Details
                    </Accordion.Title>
                    <Accordion.Content
                        active={activeIndex === 0}
                    >
                    {currentChannel.details}
                    </Accordion.Content>

                    <Accordion.Title
                        active={activeIndex === 1}
                        index={1}
                        onClick={this.setActiveIndex}
                    >
                    <Icon name="dropdown" />
                    <Icon name="user circle" />
                        Top Posters
                    </Accordion.Title>
                    <Accordion.Content
                        active={activeIndex === 1}
                    >
                    <List>
                        {this.props.usersPosts && this.displayTopPosters(this.props.usersPosts)}
                    </List>
                    
                    </Accordion.Content>

                    <Accordion.Title
                        active={activeIndex === 2}
                        index={2}
                        onClick={this.setActiveIndex}
                    >
                    <Icon name="dropdown" />
                    <Icon name="pencil alternate" />
                        Created By
                    </Accordion.Title>
                    <Accordion.Content
                        active={activeIndex === 2}
                    >
                    <Header as="h3">
                        <Image circular src={currentChannel.createdBy.avatar}/>
                        {currentChannel.createdBy.name}
                    </Header>
                    </Accordion.Content>

                </Accordion>
            </Segment>
        )
    };
}

export default MetaPanel;