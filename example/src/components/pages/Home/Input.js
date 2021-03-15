import { React, useState } from 'react'

import './Input.css'

const Input = ({ onPress }) => {
    const [distance, setDistance] = useState('')
    const [pace, setPace] = useState('')
    const [time, setTime] = useState('')

    const onSubmit = (e) => {
        if (!distance && (!pace && !time)) {
            alert('Please add either a distance or pace and time!')
            return
        }

        onPress({ distance, pace, time })

        // Submit button is already resetting, but can use these function to make sure or keep values
        // setDistance('')
        // setPace('')
        // setTime('')
    }

    return (
        <div>
            <form className='map-inputs' onSubmit={onSubmit}>
                <div>
                    <input className='input-field' name='distance' value={distance} onChange={(e) => setDistance(e.target.value)} type='text' placeholder='Distance (meters)' />
                    <h1 className='input-text'>OR</h1>
                </div>
                <div>
                    <input className='input-field' name='pace' value={pace} onChange={(e) => setPace(e.target.value)} type='text' placeholder='Pace (minutes/km)' />
                    <input className='input-field' name='time' value={time} onChange={(e) => setTime(e.target.value)} type='text' placeholder='Time (mm:ss)' />
                </div>
                <input className='input-submit' type='submit' value='Enter' />
            </form>
        </div>
    )
}

export default Input
