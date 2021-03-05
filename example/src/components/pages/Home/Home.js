import React from 'react'
import { Button } from '../../Button'
import Map from '../../Map'

const location = {
    address: '610 Purdue Mall, West Lafayette, IN 47907',
    lat: 40.4237,
    lng: -86.9212,
  } // static location for google map api

export const Home = () => {
    return (
        <div>
            <div className='input-area'>
                <form>
                    <input className='map-input' name='distance' type='distance' placeholder='Distance' />
                    <input className='map-input' name='pace' type='pace' placeholder='Pace' />
                    <input className='map-input' name='time' type='time' placeholder='Time' />
                </form>
            </div>
            <Button buttonStyle='btn--input'>Enter</Button>
            <Map location={location} zoomLevel={16} />
        </div>
    )
}

export default Home