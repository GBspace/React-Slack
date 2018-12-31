import React from 'react';
import { Progress } from 'semantic-ui-react';

const ProgressBar = ({ percentUploaded,uploadState} )=>{
    // console.log("Percentage Upload && uploadState", percentUploaded, uploadState);
    return(
        uploadState === 'uploading' && (
            <Progress
                className="progress__bar"
                // precent={percentUploaded}
                // progress
                indicating
                size="medium"
                inverted
                value={percentUploaded} progress='value'
            />
        )
    );
}

export default ProgressBar;