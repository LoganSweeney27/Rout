import React, { Component } from 'react';
import Rating from './Rating';
import { Button } from '../../Button';

import './Details.css'

//var streetView = require('../../assests/google street view.png');

class Details extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            panorama:null,
            max_route_turns:-1, //maximum # of turns on route
            currentStreetIndex:-1, //current index of turns on route
        }
        

    }
    componentDidMount() {
        //alert("updating1");
        if ((this.state.panorama == null) && (this.props.route != null)) {
            //alert("updating2");

            const panorama = new window.google.maps.StreetViewPanorama(
                document.getElementById('pano'),
                {
                position: this.props.route.routes[0].overview_path[0],
                pov: {
                    heading: 34,
                    pitch: 10,
                },
                }
            );
            this.setState({panorama:panorama});
            this.setState({max_route_turns : this.props.route.routes[0].legs[0].steps.length - 1})
            this.setState({currentStreetIndex : 0});
            //alert(this.props.route.routes[0].overview_path.length);
            this.props.my_map.setStreetView(panorama);
        }
    }
    componentDidUpdate() {
        
    }

    
    handleNextStreetView() {
        //alert("working2");
        if ((this.state.panorama != null) && (this.props.route != null) 
                    && (this.state.currentStreetIndex < this.state.max_route_turns)) {
            //alert("working1");
            this.state.panorama.setPosition(this.props.route.routes[0].legs[0].steps[++this.state.currentStreetIndex].start_location);
            this.props.my_map.setStreetView(this.state.panorama);

        }
    }
    handlePrevStreetView() {
        if ((this.state.panorama != null) && (this.props.route != null) 
                && (this.state.currentStreetIndex > 0)) {
                    this.state.panorama.setPosition(this.props.route.routes[0].legs[0].steps[--this.state.currentStreetIndex].start_location);
                    this.props.my_map.setStreetView(this.state.panorama);

        }
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
                        <Button buttonStyle='btn--regular' onClick={() => this.handlePrevStreetView()}>
                            Prev
                        </Button> 
                        <Button buttonStyle='btn--regular' onClick={() => this.handleNextStreetView()}>
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