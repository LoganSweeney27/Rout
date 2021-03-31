import { React, useState } from 'react'
import { Button } from '../../Button'
import './Input.css'

const Input = ({ onPress, onClear }) => {
    const [distance, setDistance] = useState('')
    const [pace, setPace] = useState('')
    const [time, setTime] = useState('')

    const handleEnter = (e) => {
        //e.preventDefault();
        if (!distance && (!pace && !time)) {
            alert('Please add either a distance or pace and time!')
            return
        }

        onPress({ distance, pace, time }, e)

        // Submit button is already resetting, but can use these function to make sure or keep values
        // setDistance('')
        // setPace('')
        // setTime('')
    }

    const handleClear = () => {
        onClear()
    } 

    return (
        <div className='map-inputs'>
            <div>
                <input className='input-field' name='distance' value={distance} onChange={(e) => setDistance(e.target.value)} type='text' placeholder='Distance (meters)' />
                <h1 className='input-text'>OR</h1>
            </div>
            <div>
                <input className='input-field' name='pace' value={pace} onChange={(e) => setPace(e.target.value)} type='text' placeholder='Pace (minutes/km)' />
                <input className='input-field' name='time' value={time} onChange={(e) => setTime(e.target.value)} type='text' placeholder='Time (mm:ss)' />
            </div>
            <Button buttonStyle='btn--input' onClick={(e) => handleEnter(e)}>
                Enter
            </Button>
            <Button buttonStyle='btn--input' onClick={handleClear}>
                Clear
            </Button>
        </div>
    )
}

export default Input
