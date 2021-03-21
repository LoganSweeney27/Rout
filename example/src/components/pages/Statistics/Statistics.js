import React from 'react'
import Comparison from './Comparison'
import LineChart from './LineChart'

import './Statistics.css'

const UserStatistics = () => {
    return (
        <div className='stats-container'>
            <h1 className='stats-text'>
                User Statistics
            </h1>
            <div>
                <h1>
                    Calories
                </h1>
                <LineChart />
            </div>
            <div>
                <h1>
                    Comparison
                </h1>
                <Comparison />
            </div>
        </div>
    )
}

export default UserStatistics