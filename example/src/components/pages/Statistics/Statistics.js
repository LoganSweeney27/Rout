import React from 'react'
import Comparison from './Comparison'
import LineChart from './LineChart'

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
                {/* <Comparison className='stats-graph'/> */}
            </div>
            <div>
                <div className='stats-line'></div>
                <h1 className='stats-subheader'>
                    Calories
                </h1>
                <LineChart className='stats-graph'/>
            </div>
            <div>
            <div className='stats-line'></div>
                <h1 className='stats-subheader'>
                    Comparison
                </h1>
                <Comparison className='stats-graph'/>
                <div className='stats-line' style={{ marginTop: '40px' }}></div>
            </div>
        </div>
    )
}

export default UserStatistics