import React, { Component } from 'react';

import './Details.css'

var streetView = require('../../assests/google street view.png');

class Details extends React.Component {
    render() {
        return (
            <div className='details-container'>
                <div className='details-info'>
                    <div className='details-row'>
                        <h1 className='details-text'>
                            Distance: {this.props.routeDistance}
                        </h1>
                        <h1 className='details-text'>
                            Time: N/A
                        </h1>
                        <h1 className='details-text'>
                            Pace: N/A
                        </h1>
                    </div>
                    <div className='details-row'>
                        <h1 className='details-text'>
                            Calories Burned: N/A
                        </h1>
                        <h1 className='details-text'>
                            Difficulty Rating: N/A
                        </h1>
                        <h1 className='details-text'>
                            Starting Location: N/A
                        </h1>
                    </div>
                </div>
                <div className='details-pic'>
                    <img className='details-img' src={streetView.default}  alt='Street View'/>
                </div>
            </div>
        )
    }
}

export default Details