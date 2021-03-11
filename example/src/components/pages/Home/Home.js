import React from 'react'
import { useState } from 'react'
import { Button } from '../../Button'
import Details from './Details'
// import { Button } from '../../Button'
import Map from '../../Map'
import Input from './Input'

import './Home.css'

const location = {
    address: '620 Purdue Mall, West Lafayette, IN 47907',
    lat: 40.4237,
    lng: -86.9212,
  } // static location for google map api

export const Home = () => {
    const [showDetails, setShowDetails] = useState(false);

    // takes in the data from the input fields, can be used to give to the alogrithm when implemented together
    const addData = (data) => {
        console.log(data)
    }

    return (
        <div>
            <Input onPress={addData} />
            {/* <Button buttonStyle='btn--input'>Enter</Button> */}
            <Map location={location} zoomLevel={16} />
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