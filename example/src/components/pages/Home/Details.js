import React from 'react';
import Rating from './Rating';

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
                            Time: {this.props.time}
                        </h1>
                        <h1 className='details-text'>
                            Pace: {this.props.pace}
                        </h1>
                    </div>
                    <div className='details-row'>
                        <h1 className='details-text'>
                            Calories Burned: {this.props.calories}
                        </h1>
                        <h1 className='details-text'>
                            Difficulty Rating: {this.props.difficulty}
                        </h1>
                    </div>
                    <div className='details-row'>
                        <h1 className='details-text'>
                            Starting Location: {this.props.address}
                        </h1>
                    </div>
                    <div className='details-row-rating'>
                        <Rating rating={0} starDimension="40px" starSpacing="15px" routeID={this.props.routeID}/>
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