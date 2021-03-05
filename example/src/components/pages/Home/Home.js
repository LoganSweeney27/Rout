import React from 'react'
import Map from '../../Map'

const location = {
    address: '610 Purdue Mall, West Lafayette, IN 47907',
    lat: 40.4237,
    lng: -86.9212,
  } // static location for google map api

export const Home = () => {
    return (
        <div>
            <Map location={location} zoomLevel={16} />
        </div>
    )
}

export default Home