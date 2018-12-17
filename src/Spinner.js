import React from 'react';
import {Loader,Dimmer} from 'semantic-ui-react';

export default ()=>{
    return(
        <Dimmer active>
            <Loader size="huge"  content={"Your wait will be paid.."}/>
        </Dimmer>
    );
};