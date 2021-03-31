import React from 'react'
import { useState } from 'react'
import { Button } from '../../Button'
import Details from './Details'
// import { Button } from '../../Button'
import NewMap from './NewMap'
import Input from './Input'

import './Home.css'


export const Home = () => {
    const [showDetails, setShowDetails] = useState(false);

    // takes in the data from the input fields, can be used to give to the alogrithm when implemented together
    // const addData = (data) => {
    //     console.log(data)

    // }

    return (
        
        <div>
            {/* <Input onPress={addData} /> */}
            {/* <Button buttonStyle='btn--input'>Enter</Button> */}
            <NewMap />
            {showDetails && <Details />}
            <div className='details-btn'>
                <Button buttonStyle='btn--details' onClick={() => setShowDetails(!showDetails)}>
                    Details ^
                </Button>
            </div>
        </div>
    )
}

export default Home