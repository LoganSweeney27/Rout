import React, { Component } from 'react';
import Rating from './Rating';
import { Button } from '../../Button';

import './Details.css'

//var streetView = require('../../assests/google street view.png');

class Details extends React.Component {
    constructor(props) {
        super(props);

    }
    componentDidMount() {
        alert(window.document.getElementById('pano'));
        alert(window.document.getElementById('elevation_chart'));
    }
    componentDidUpdate() {

        // alert("udpated");
        // const panorama = new window.google.maps.StreetViewPanorama(
        //     window.document.getElementById('pano'),
        //     {
        //       position: this.state.route.routes[0].overview_path[0],
        //       pov: {
        //         heading: 34,
        //         pitch: 10,
        //       },
        //     }
        // );
        // this.state.my_map.setStreetView(panorama);
        
    }


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
                        <h1 className='details-text'>
                            Starting Location: {this.props.address}
                        </h1>
                    </div>
                    <div className='details-row-rating'>
                        <Rating rating={0} starDimension="40px" starSpacing="15px" routeID={this.props.routeID}/>
                    </div>
                    <div id="elevation_chart"></div>
                </div>
                <div className='details-pic'>
                    {/* <div className='details-streetview'> */}
                    <div id="pano"></div>
                    <div className='details-streetview-buttons'>
                        <Button buttonStyle='btn--regular' onClick={() => this.setState({ showDetails: (!this.state.showDetails) })}>
                            Prev
                        </Button> 
                        <Button buttonStyle='btn--regular' onClick={() => this.setState({ showDetails: (!this.state.showDetails) })}>
                            Next
                        </Button>
                    </div>
                    {/* <img className='details-img' src={streetView.default}  alt='Street View'/> */}
                </div>
            </div>
        )
        

    }
}

export default Details