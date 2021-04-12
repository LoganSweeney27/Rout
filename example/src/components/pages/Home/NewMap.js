import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import './NewMap.css'
import Input from './Input';
//import SelectInput from '@material-ui/core/Select/SelectInput';
import { Button } from '../../Button';
import Details from './Details';
import UserStore from '../Login/Stores/UserStore';

import './Input.css'


const styles = {
  root: {
    flexGrow: 1,
  },
  
};
let startPoint = null;
let wayptOn = false;
let markers = [];
let waypts = [];
function addMarker(location, map) {
  const marker = new window.google.maps.Marker({
      position: location,
      map: map,
  });
  markers.push(marker);
}

function setMapOnAll(map) {
  for (let i = 0; i < markers.length; i++) {
      markers[i].setMap(map);
  }
}

function clearMarkers() {
  setMapOnAll(null);
}

function deleteMarkers() {
  clearMarkers();
  markers = [];
}




function newCoordinatesLocation(lat, lng, distance, direction) {
  //direction = (direction * 180) / Math.PI;
  direction = Math.random() * Math.PI * 2;
  lat = lat + (distance * Math.cos(direction) / 111111);
  lng = lng + (distance * Math.sin(direction) / Math.cos(lat) / 111111);
  let latlng = new window.google.maps.LatLng(lat, lng);
  return latlng;
}

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
}

// Takes an array of ElevationResult objects, draws the path on the map
// and plots the elevation profile on a Visualization API ColumnChart.
function plotElevation(elevations, status) {
  const chartDiv = document.getElementById("elevation_chart");

  if (status !== "OK") {
  // Show the error code inside the chartDiv.
  chartDiv.innerHTML =
        "Cannot show elevation: request failed because " + status;
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

  // Draw the chart using the data within its DIV.
  chart.draw(data, {
  height: 150,
  legend: "none",
  // @ts-ignore TODO(jpoehnelt) update to newest visualization library
  titleY: "Elevation (m)",
  });
}


function listenforStart(map) {
  var startPointListener = map.addListener("click", (event) => {
    addMarker(event.latLng, map);
    startPoint = event.latLng;
    window.google.maps.event.removeListener(startPointListener);

  });
}





function geocodeAddr(geocoder, addr) {
  //const addr = document.getElementById("addr");
  geocoder.geocode({address: addr}, (results, status) => {
    if (status == "OK") {
      startPoint = results[0].geometry.location;
    } else {
      // alert(
      //   "Address geocoding was not successful for the following reason: " + status
      // );
    }
  });
}



class NewMap extends Component {
  constructor(props){
    super(props);

    var today = new Date(),
    mdy = (today.getMonth() + 1) + "/" + today.getDate() + "/" + today.getFullYear();

    this.state ={
      mapIsReady:false,
      chartIsReady:false,
      routeDistance:"", //distance of the produced route
      routeDistance_m: '', //distance of real produced route in distance
      d_service:null,
      d_renderer:null,
      d_geocoder:null,
      my_map:null,
      wayptListener:null,
      addr: '',
      distance: '', //inputted distance, could be in miles or kilometers
      distance_m:'', //distance in meters
      pace: '',
      time: '',
      final_time:'',
      final_pace: '',
      units: 'Distance (Kilometers)',
      unitType: 'kilometers',
      showDetails: false,
      calories: 0,
      route: null,
      loadRoute: "Didn't work :(", // state for loading routes
      wasCreated: false,
      date: mdy,
      routeID: '', // routeID used for updating rating of route
      inputTypes: false, // input type boolean used to show either distance or pace/time input fields
      hasDistance: false,
      hasPace: false,
      hasTime: false,
    }

    this.initMap = this.initMap.bind(this)
    this.lastDirections = null;
    this.savedDirections = null;
  }


  componentDidMount(){
    this.loadGoogleMapScript();
    window.gm_authFailure = this.gm_authFailure;
    //we load the google map script when its ready, we get the venues when they are ready then this.getVenues()
  }

  loadGoogleMapScript(){
    const ApiKey = 'AIzaSyDekWG_GZBqJ3j0Kt9t-B0ayBcU9wLHlsk'

    const scriptMap = window.document.createElement('script')
    scriptMap.src = `https://maps.googleapis.com/maps/api/js?key=${ApiKey}&libraries=places`
    scriptMap.async = true;
    scriptMap.defer= true;
    scriptMap.onerror = function(){window.alert("The Google Maps API failed to load data!")}

    const scriptChart = window.document.createElement('script')

    scriptChart.src = 'https://www.gstatic.com/charts/loader.js'
    scriptChart.onerror = function(){window.alert("The Google Charts API failed to load data!")}

    //this is a callback to wait until the code has loaded
    scriptMap.addEventListener('load', () =>{
      this.setState({mapIsReady:true})
      scriptChart.addEventListener('load', () => {
        if (this.state.mapIsReady) {
          window.google.charts.load('current', {packages: ['corechart']});
          this.setState({chartIsReady:true});
  
        }
      });

    });
    
    window.document.body.appendChild(scriptMap)
    window.document.body.appendChild(scriptChart);

  }

  componentDidUpdate(){
   //once the script is uploaded to the window load up the map 
    
    if (this.state.my_map == null) {
      
      this.initMap()
    }
  }



  //create markers
  initMap() {

    //if map is ready to load
    if(this.state.mapIsReady && this.state.chartIsReady){

    const map = new window.google.maps.Map(document.getElementById('map'), {
      center: {lat: 40.4259, lng: -86.9081},
      zoom: 13,
    });
    if (this.state.my_map == null) {
      this.setState({my_map: map});
    }
    // Create A Map use window so the browser can access it
    //const map = this.state.my_map;

    if (this.state.d_renderer == null) {
      const directionsRenderer = new window.google.maps.DirectionsRenderer({
        draggable: true,
        map,
      }); 
      this.setState({d_renderer : directionsRenderer});
    }
    if (this.state.d_service == null) {
      const directionsService = new window.google.maps.DirectionsService();
      this.setState({d_service : directionsService});
    }
    if (this.state.d_geocoder == null) {
      const geocoder = new window.google.maps.Geocoder();
      this.setState({d_geocoder : geocoder});
    }
    const addy = document.getElementById("addy");
    const autocomplete = new window.google.maps.places.Autocomplete(addy);

    listenforStart(map);

    }//end of if statement
  }

  myCalculateAndDisplayRoute(
    start,
    distance
  ) {
    console.log("added marker");
    //add that location as a waypoint
    
    var totaldistance = 0;
    //var counter = 0;
    console.log("distance : " + distance); //3000
    console.log("totaldistance : " + totaldistance); //0
    //totaldistance = 3500;

    //while distance is not with +-error of request distance
    var error = 400;

    // this.setState({ wasCreated: this.createRoute(start, error, distance, 0) });
    this.createRoute(start, error, distance, 0);
    setTimeout(() => {
      if (this.state.wasCreated) {
        this.pushRoute()
      }
    }, 2000);

        
  }


  createRoute(start, error, distance, depth) {
    console.log("test1");
    if (depth > 8) {
      alert("Could not find route at this starting point.");
      this.setState({ wasCreated: false });
      return;
    }
    var directionsService = this.state.d_service;
    var directionsRenderer = this.state.d_renderer;
    var map = this.state.my_map;

    if (!wayptOn) {
      waypts = [];
      waypts.push({
          location: newCoordinatesLocation(start.lat(), start.lng(), distance / 2, 90),
          stopover: false,
      });
    }
    directionsService.route(
      {
          origin: start,
          destination: start,
          waypoints: waypts,
          optimizeWaypoints: false,
          avoidHighways: true,
          travelMode: window.google.maps.TravelMode.WALKING,
      },
      (response, status) => {
          if (status === "OK" && response) {
              const route = response.routes[0];
              let totaldistance = 0;
  
              for (let i = 0; i < route.legs.length; i++) {
                  totaldistance += route.legs[i].distance.value;
              }
              console.log("totaldistance : " + totaldistance);
              console.log("error : " + error);
              console.log("distance : " + distance);


              // directionsRenderer.setDirections(response);
              // directionsRenderer.setMap(map);
              console.log(parseFloat(distance) + parseFloat(error));
              console.log(totaldistance);
              if (((parseFloat(distance) + parseFloat(error)) > totaldistance)
                  && ((parseFloat(distance) - parseFloat(error)) < totaldistance)) {
                console.log("test");
                if (!wayptOn) {
                    directionsRenderer.setDirections(response);
					          this.lastDirections = response;
                    directionsRenderer.setMap(map);

                } else if (wayptOn && (totaldistance <= distance)) {
                    directionsRenderer.setDirections(response);
					          this.lastDirections = response;
                    directionsRenderer.setMap(map);

                } else {
                    window.alert("WAYPOINTS TOO FAR AWAY, CLEAR AND TRY AGAIN")
                    this.setState({ wasCreated: false });
                }
                const elevator = new window.google.maps.ElevationService();
                // Draw the path, using the Visualization API and the Elevation service.
                displayPathElevation(route.overview_path, elevator);
                this.convertToDisplayDistance(totaldistance);
                this.estimate_time(totaldistance); //estimate for final time value
                this.estimate_calories(totaldistance); //estimate for final calories burned
                //this.setState({routeDistance: displayDistance});
                this.setState({ routeDistance_m: totaldistance })
                this.setState({ route: response })
                this.setState({ wasCreated: true });
                return;
              } else {
                this.createRoute(start,error,distance, ++depth);
              }
  
          } else {
              window.alert("Directions request failed due to " + status);
              this.setState({ wasCreated: false });
          }
      }
    );
  }
  
  saveRoute() {
	  this.savedDirections = this.lastDirections;
  }
  
  async loadRoute() {
    // if (this.lastDirections == null) {
    //   alert("lastDirections is null!");
    // }
    // else {
    //   this.clearMap();
    //   this.state.d_renderer.setDirections(this.savedDirections);
    //   this.state.d_renderer.setMap(this.state.my_map);
    // }
    try {
      let res = await fetch('/getResponse', {
        method: 'post',
        headers: {
            'Accept': 'application/json',
            'Content-type': 'application/json'
        }
      });
      let result = await res.json();
        if (result && result.success) {
            // If successful set response object
            this.setState({ loadRoute: result.response })
        } else {
            alert("Could not get route response object.");
        }
    } catch(e) {
        console.log(e)
    }
  }

  gm_authFailure(){
    window.alert("Google Maps error!")
  }

  handleErrors(response) {
  if (!response.ok) {
      throw Error(response.statusText);
  }
  return response;
  }

  convertToMeters() {
    if (this.state.distance) {
      if (this.state.unitType === 'kilometers') {
        this.state.distance_m = parseFloat(this.state.distance) * 1000;
      } else {
        //conversion from miles to meters
        this.state.distance_m = parseFloat(this.state.distance) * 1609.34;
      }
    } else {
      if ((this.state.pace != null) && (this.state.time != null)) {
        this.state.distance_m = (parseFloat(this.state.time) / parseFloat(this.state.pace)) * 1609.34;
      }
    }
  }

  convertToDisplayDistance(distance) {
    if (this.state.unitType === 'kilometers') {
      this.setState({routeDistance : ((parseFloat(distance) / 1000) + " km") });
    } else {
      //convert meters to miles
      this.setState({routeDistance : ((parseFloat(distance) * 0.000621371) + " miles")});
    }
  }


  estimate_time(distance_m) {
    // 0.00559234 is 9 min/mile as min/meter
    // multiplied by 60 to get in seconds
    this.setState({final_time : (0.00559234 * parseFloat(distance_m) * 60).toFixed(2)});
  }


  estimate_calories(distance) {
    // 0.00062 is the conversion rate from meters to miles
    // 100 is the average calories burned per mile
    this.setState({ calories: (100 * (distance * 0.00062)).toFixed(0) })
  }


  clearMap = () => {
    this.state.d_renderer.setDirections(null);
    this.state.d_renderer.setMap(null);
    deleteMarkers();
    startPoint = null;
    waypts = [];
    wayptOn = false;
    if (this.state.wayptListener != null) {
      window.google.maps.event.removeListener(this.state.wayptListener);
      this.setState({wayptListener:null});
    }
    listenforStart(this.state.my_map);
  }

  addWaypoints = () => {
    wayptOn = true;
    if (this.state.wayptListener == null) {
      var myWayptListener = this.state.my_map.addListener("click", (event) => {
        addMarker(event.latLng, this.state.my_map);
        waypts.push({
          location: event.latLng,
          stopover: false,
        });
      })
      this.setState({wayptListener: myWayptListener});
    }
  }

  // addData = (data, e) => {
  addData = () => {
    //alert(e);
    //e.preventDefault();
    // console.log(data)
    // console.log(data.distance)
    // console.log(data.addr)
    //alert(this.state.addr)
    const address = document.getElementById("addr");
    if (address) {
      geocodeAddr(this.state.d_geocoder, this.state.addr);
    }
    this.convertToMeters();
    
    //const autocomplete = new window.google.maps.places.Autocomplete(this.state.addr);
    setTimeout(() => {
      if (startPoint) {
        if (this.state.distance_m) {

          //this.setState({routeDistance: data.distance});
          this.myCalculateAndDisplayRoute(startPoint, this.state.distance_m);

        } else {
          alert("No Distance or Time and Pace entered");
        }
      } else {
        alert("No start point selected");
      }
    }, 400)
  } 

  //Call to push data to database
  async pushRoute() {
    try {
      let final_pace;
      if (this.state.pace === '') {
        final_pace = 9;
      } else {
        final_pace = this.state.pace;
      }
      this.setState({ final_pace: final_pace });
      let res = await fetch('/sendRoute', {
        method: 'post',
        headers: {
            'Accept': 'application/json',
            'Content-type': 'application/json'
        },
        body: JSON.stringify({
            response: this.state.route,
            username: UserStore.username,
            distance: this.state.routeDistance_m,
            pace: final_pace,
            time: this.state.final_time,
            calories: this.state.calories,
            difficulty: -1,
            rating: -1,
            location: this.state.addr,
            date: this.state.date,
          })
      });
      let result = await res.json();
        if (result && result.success) {
            // If successful call new sql query to obtain last routeID
            this.setRouteID();
        } else {
            alert("Could not insert information into database or user is not logged in!");
        }
    } catch(e) {
        console.log(e)
    }
  }

  async setRouteID() {
    try {
      let res = await fetch('/getRouteID', {
        method: 'post',
        headers: {
            'Accept': 'application/json',
            'Content-type': 'application/json'
        }
      });
      let result = await res.json();
        if (result && result.success) {
            // If successful update routeID created for rating update later
            this.setState({ routeID: result.routeID })
        } else {
            alert("Could not get last routes routeID!");
        }
    } catch(e) {
        console.log(e)
    }
  }


  handleEnter = (e) => {
    e.preventDefault();
    if (!(this.state.hasDistance || (this.state.hasPace && this.state.hasTime))) {
        alert('Please add either a distance or pace and time!')
        return
    }

    // let data = [this.state.addr, this.state.distance, this.state.pace, this.state.time, this.state.unitType]
    // alert(data)
    // this.addData(data, e)
    this.addData()

  }

  handleChangeUnit = (e) => {
    // e.preventDefault();
    if (this.state.units === 'Distance (Kilometers)') {
        this.setState({ units: 'Distance (Miles)' })
        this.setState({ unitType: 'miles' })
    } else {
      this.setState({ units: 'Distance (Kilometers)' })
      this.setState({ unitType: 'kilometers' })
    }
  }

  handleClear = () => {
    this.clearMap()
  }

  handleWaypoints = () => {
    this.addWaypoints()
  }

  handleSave = () => {
	  this.saveRoute();
  }

  handleLoad = () => {
	  this.loadRoute();
  }


  render() {
    return (
      <div>
        <div>
          <div className='map-inputs'>
            <div>
                <input className='input-field' name='addr' value={this.state.addr} onChange={(e) => this.setState({ addr: e.target.value })} type='text' id='addy' placeholder='Address' />
            </div>
            <div>
              {!this.state.inputTypes && <input className='input-field' name='distance' value={this.state.distance} onChange={(e) => { this.setState({ distance: e.target.value }); this.setState({ hasDistance: true })}} type='text' placeholder={this.state.units} />} 
              {this.state.inputTypes && <input className='input-field' name='pace' value={this.state.pace} onChange={(e) => {this.setState({ pace: e.target.value }); this.setState({ hasPace: true })}} type='text' placeholder='Pace (minutes/mile)' />}
              {this.state.inputTypes && <input className='input-field' name='time' value={this.state.time} onChange={(e) => {this.setState({ time: e.target.value }); this.setState({ hasTime: true })}} type='text' placeholder='Time (minutes)' />}
            </div>
            <div>
              {this.state.inputTypes ? <Button buttonStyle='btn--input' onClick={() => this.setState({ inputTypes: (!this.state.inputTypes) })}>Distance</Button> : <Button buttonStyle='btn--input' onClick={() => this.setState({ inputTypes: (!this.state.inputTypes) })}>Pace/Time</Button>}
              <Button buttonStyle='btn--input' onClick={(e) => this.handleChangeUnit(e)}>
                  Change Units
              </Button>
              <Button buttonStyle='btn--input' onClick={this.handleSave}>
                  Save
              </Button>
              <Button buttonStyle='btn--input' onClick={this.handleLoad}>
                  Load
              </Button>
            </div>
            <div style={{ paddingTop: "10px" }}>
              <Button buttonStyle='btn--input' onClick={(e) => this.handleEnter(e)}>
                  Enter
              </Button>
              <Button buttonStyle='btn--input' onClick={this.handleClear}>
                Clear
              </Button>
              <Button buttonStyle='btn--input' onClick={this.handleWaypoints}>
                  Waypoints
              </Button>
            </div>
            {/* <div>
            <input className='input-field' name='final_time' value={this.state.final_time} onChange={(e) => this.setState({ final_time: e.target.value })} type='text' placeholder={'Final Run Time'} />
            </div>
            <Button buttonStyle='btn--input' onClick={this.handleFinalTimeSave}>
                Final Run Time Enter
            </Button> */}
			
        </div>
          <h1>{this.state.routeDistance}</h1>
        </div>
        <div>
          <main id="map" role="application"></main>
          <div id="elevation_chart"></div>
        </div>
        <div>
        {this.state.showDetails && <Details routeDistance={this.state.routeDistance} time={this.state.final_time} pace={this.state.final_pace} calories={this.state.calories} difficulty='3' address={this.state.addr} routeID={this.state.routeID}/>}
            <div className='details-btn'>
                <Button buttonStyle='btn--details' onClick={() => this.setState({ showDetails: (!this.state.showDetails) })}>
                    Details ^
                </Button>
            </div>
        </div>
      </div>
    )
  }
}

export default withStyles(styles)(NewMap);