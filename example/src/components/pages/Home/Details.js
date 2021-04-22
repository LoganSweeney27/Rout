import React, { Component } from 'react';
import Rating from './Rating';
import { Button } from '../../Button';

import './Details.css'

//var streetView = require('../../assests/google street view.png');


/* Displays the elevation along the given path */
function displayPathElevation(
    path,
    elevator,
    ) {
    // Create a PathElevationRequest object using this array.
    // Ask for 256 samples along that path.
    // Initiate the path request.
    elevator.getElevationAlongPath(
        {
        path: path,
        samples: 256,
        },
        plotElevation
    );
} /* displayPathElevation() */
  
  
  
/* Takes an array of ElevationResult objects, draws the path on the map
    and plots the elevation profile on a Visualization API ColumnChart. */
function plotElevation(elevations, status) {
    //alert(elevations)
    //alert(window.document.getElementsById("elevation_chart"));
    const chartDiv = window.document.getElementById("elevation_chart");

    if (status !== "OK") {
    // Show the error code inside the chartDiv.
        alert("Cannot show elevation: request failed because " + status);
        // chartDiv.innerHTML =
        //         "Cannot show elevation: request failed because " + status;
        return;
    }
    // Create a new chart in the elevation_chart DIV.
    const chart = new window.google.visualization.ColumnChart(chartDiv);

    // Extract the data from which to populate the chart.
    // Because the samples are equidistant, the 'Sample'
    // column here does double duty as distance along the
    // X axis.
    const data = new window.google.visualization.DataTable();
    data.addColumn("string", "Sample");
    data.addColumn("number", "Elevation");

    for (let i = 0; i < elevations.length; i++) {
        data.addRow(["", elevations[i].elevation]);
    }
    //Draw the chart using the data within its DIV.
    chart.draw(data, {
        height: 150,
        legend: "none",
        // @ts-ignore TODO(jpoehnelt) update to newest visualization library
        titleY: "Elevation (m)",
    });
}
  


class Details extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            panorama:null,
            max_route_turns:-1, //maximum # of turns on route
            currentStreetIndex:-1, //current index of turns on route
            elevator:null,
        }
        

    }
    componentDidMount() {
        //alert("updating1");
        if (this.props.route != null) {
            this.setState({max_route_turns : this.props.route.routes[0].legs[0].steps.length - 1})
            this.setState({currentStreetIndex : 0});
            this.updateStreetView();
            this.updateAltitude();
            // alert(this.state.panorama);
            // alert(this.state.elevator);
        }

    }

    componentDidUpdate() {
        //check if route has updated
        if ((this.props.route != null) &&
                    (this.props.route.routes[0].legs[0].steps.length - 1) != (this.state.max_route_turns)) {
            this.setState({max_route_turns : this.props.route.routes[0].legs[0].steps.length - 1})
            this.setState({currentStreetIndex : 0});

            this.updateStreetView();
            this.updateAltitude();
        }
    }


    updateStreetView() {
        if ((this.state.panorama == null)) {
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
        } else {

            this.state.panorama.setPosition(this.props.route.routes[0].legs[0].steps[0].start_location);
            this.props.my_map.setStreetView(this.state.panorama);
        }
    }

    updateAltitude() {
        if (this.state.elevator == null) {
            const elevator = new window.google.maps.ElevationService();
            this.setState({elevator : elevator});
            displayPathElevation(this.props.route.routes[0].overview_path, elevator);
        } else {
            displayPathElevation(this.props.route.routes[0].overview_path, this.state.elevator);
        }
    }

    handleNextStreetView() {
        //alert("working2");
        if ((this.state.panorama != null) && (this.props.route != null)) {
            if (this.state.currentStreetIndex < this.state.max_route_turns) {
                //alert("working1");
                this.state.panorama.setPosition(this.props.route.routes[0].legs[0].steps[++this.state.currentStreetIndex].start_location);
                this.props.my_map.setStreetView(this.state.panorama);
            } 
        }
    }
    handlePrevStreetView() {
        if ((this.state.panorama != null) && (this.props.route != null)) {
            if (this.state.currentStreetIndex > 0) {
                this.state.panorama.setPosition(this.props.route.routes[0].legs[0].steps[--this.state.currentStreetIndex].start_location);
                this.props.my_map.setStreetView(this.state.panorama);
            }
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

export default Details;