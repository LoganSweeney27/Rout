import React from 'react'
import Comparison from './Comparison'
import LineChart from './LineChart'
import PreviousRoutes from './PreviousRoutes'
import TotalCalories from './TotalCalories'

import './Statistics.css'

const UserStatistics = () => {
    return (
        <div className='stats-container'>
            <h1 className='stats-header'>
                User Statistics
            </h1>
            <div>
                <div className='stats-line'></div>
                <h1 className='stats-subheader'>
                    Past Routes
                </h1>
                <PreviousRoutes />
            </div>
            <div>
                <div className='stats-line'></div>
                <h1 className='stats-subheader'>
                    Calories
                </h1>
                <TotalCalories />
                <LineChart className='stats-graph'/>
            </div>
            <div>
            <div className='stats-line'></div>
                <h1 className='stats-subheader'>
                    Comparison
                </h1>
                <Comparison className='stats-graph'/>
            </div>
        </div>
    )
}

export default UserStatistics