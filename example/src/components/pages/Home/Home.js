import React from 'react'
// import { Button } from '../../Button'
import Map from '../../Map'
import Input from './Input'

const location = {
    address: '610 Purdue Mall, West Lafayette, IN 47907',
    lat: 40.4237,
    lng: -86.9212,
  } // static location for google map api

export const Home = () => {

    const addData = (data) => {
        console.log(data)
    }

    return (
        <div>
            <Input onPress={addData} />
            {/* <Button buttonStyle='btn--input'>Enter</Button> */}
            <Map location={location} zoomLevel={16} />
        </div>
    )
}

export default Home