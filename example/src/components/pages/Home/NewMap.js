import React, { Component, useState } from 'react';
import { withStyles } from '@material-ui/core/styles';
import './NewMap.css'
import { Button } from '../../Button';
import './Input.css'

let startPoint = null;
let wayptOn = false;
let markers = [];
let waypts = [];

const styles = {
  root: {
    flexGrow: 1,
  },
};

/* This function adds markers to the given map */
function addMarker(location, map) {
  const marker = new window.google.maps.Marker({
      position: location,
      map: map,
  });
  markers.push(marker);
} /* addMarker() */


/* This  functions puts all the markers on the given map,
  and clears them if map is null */
function setMapOnAll(map) {
  for (let i = 0; i < markers.length; i++) {
      markers[i].setMap(map);
  }
} /* setMapOnAll() */

/* Clears all the markers from the given map */
function clearMarkers() {
  setMapOnAll(null);
} /* clearMarkers() */

/* Deletes all the markers in global markers list */
function deleteMarkers() {
  clearMarkers();
  markers = [];
} /* deleteMarkers() */



/* Returns a location a given distance away from the lat lng given
  using the given direction */
function newCoordinatesLocation(lat, lng, distance, direction) {
  //direction = (direction * 180) / Math.PI;
  lat = lat + (distance * Math.cos(direction) / 111111);
  lng = lng + (distance * Math.sin(direction) / Math.cos(lat) / 111111);
  let latlng = new window.google.maps.LatLng(lat, lng);
  

  return latlng;
} /* newCoordinatesLocation() */



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
} /* plotElevation() */


/* Listens for starting marker to be placed */
function listenforStart(map) {
  var startPointListener = map.addListener("click", (event) => {
    addMarker(event.latLng, map);
    startPoint = event.latLng;
    window.google.maps.event.removeListener(startPointListener);

  });
} /* listenforStart() */





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




/* NewMap class defines map and all functions that go with it
  It also displays the map and the directions */
class NewMap extends Component {


  constructor(props){
    super(props);
    this.state ={
      mapIsReady:false,
      chartIsReady:false,
      routeDistance:"", //returned distance from algorithm, converted to units given by user
      d_service:null,
      d_renderer:null,
      d_geocoder:null,
      my_map:null, //Map object
      wayptListener:null,
      addr: '',
      distance: '', //given distance from user (either in miles or kilometers)
      distance_m:'', //distance from user converted to meters
      pace: '', //pace given by user in min / mile
      route:null, //route response, DirectionsResult object after algorithm runs
      time: '', //time given by user
      units: 'Distance (Kilometers)', //Text displayed in Distance input box
      unitType: 'kilometers', //type of units in "units"
    }

    this.initMap = this.initMap.bind(this)
    this.loadGoogleMapScript();

  }

  /* Runs after component is mounted, initalizes Map and algorithm */
  componentDidMount(){
    // this.loadGoogleMapScript();

    window.gm_authFailure = this.gm_authFailure;

    //we load the google map script when its ready
    //we get the venues when they are ready
    //this.getVenues()
    
  } /* componentDidMount() */

  /* Loads information for Google Maps API */
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
  } /* loadGoogleMapScript() */


  /* when component is updated, upload map */
  componentDidUpdate(){
   //once the script is uploaded to the window load up the map 

    if (this.state.my_map == null) {
      this.initMap()
    }
  } /* componentDidUpdate() */



  /* this function initializes the map and prepares*/
  initMap(){
    //if map is ready to load
    if(this.state.mapIsReady && this.state.chartIsReady){
      const map = new window.google.maps.Map(document.getElementById('map'), {
        center: {lat: 40.4259, lng: -86.9081},
        zoom: 13,
      });
      // if (document.getElementById('pano') == null) {
      //   alert("is null");
      // }
      // const panorama = new window.google.maps.StreetViewPanorama(
      //   document.getElementById('pano'),
      //   {
      //     position: this.state.route.geocoded_waypoints[0],
      //     pov: {
      //       heading: 34,
      //       pitch: 10,
      //     },
      //   }
      // );
      // map.setStreetView(panorama);

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

  } /* initMap() */

  /* Calculates and displays route, also updates route state
    for directions result */
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

    this.createRoute(start, error, distance, 0, Math.random() * 2 * Math.PI);
    setTimeout(()=> {
      const panorama = new window.google.maps.StreetViewPanorama(
        document.getElementById('pano'),
        {
          position: this.state.route.routes[0].overview_path[0],
          pov: {
            heading: 34,
            pitch: 10,
          },
        }
      );
      this.state.my_map.setStreetView(panorama);
    }, 2000);
    
    
      //wait(1000);
      //console.log(counter);
        
  } /* myCalculateAndDisplayRoute() */

  /* Recursive function to find route of specified distance */
  createRoute(start, error, distance, depth, beginDirection) {
    console.log("test1");
    if (depth > 8) {
      alert("Could not find route at this starting point.");
      return;
    }
    var directionsService = this.state.d_service;
    var directionsRenderer = this.state.d_renderer;
    var map = this.state.my_map;

    if (!wayptOn) {
      waypts = [];
      waypts.push({
          location: newCoordinatesLocation(start.lat(), start.lng(),
                        distance / 2, beginDirection + (depth * (Math.PI / 4))),
          stopover: false,
      });

      // addMarker(newCoordinatesLocation(start.lat(), start.lng(),
      // distance / 2, beginDirection + (depth * (Math.PI / 4))), this.state.my_map);
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
              console.log(parseInt(distance) + parseInt(error));
              console.log(totaldistance);
              if (((parseInt(distance) + parseInt(error)) > totaldistance)
                  && ((parseInt(distance) - parseInt(error)) < totaldistance)) {
                if (!wayptOn) {
                    directionsRenderer.setDirections(response);
                    directionsRenderer.setMap(map);

                } else if (wayptOn && (totaldistance <= distance)) {
                    directionsRenderer.setDirections(response);
                    directionsRenderer.setMap(map);

                } else {
                    window.alert("WAYPOINTS TOO FAR AWAY, CLEAR AND TRY AGAIN")
                }
                const elevator = new window.google.maps.ElevationService();
                // Draw the path, using the Visualization API and the Elevation service.
                displayPathElevation(route.overview_path, elevator);
                this.convertToDisplayDistance(totaldistance);
                //this.setState({routeDistance: displayDistance});
                this.setState({route: response});

              } else {
                this.createRoute(start,error,distance, ++depth, beginDirection);
              }
  
          } else {
              window.alert("Directions request failed due to " + status);
          }
      }
    );
  } /* createRoute() */

  /* Alerts user to error if Google Map does not load */
  gm_authFailure(){
      window.alert("Google Maps error!")
  } /* gm_authFailure() */


  /* Handles errors */
  handleErrors(response) {
    if (!response.ok) {
        throw Error(response.statusText);
    }
    return response;
  } /* handleErrors() */


  /* Converts user inputted distance to meters for algorithm */
  convertToMeters() {
    if (this.state.distance) {
      if (this.state.unitType === 'kilometers') {
        this.state.distance_m = parseInt(this.state.distance) * 1000;
      } else {
        //conversion from miles to meters
        this.state.distance_m = parseInt(this.state.distance) * 1609.34;
      }
    } else {
      if ((this.state.pace != null) && (this.state.time != null)) {
        this.state.distance_m = (parseInt(this.state.time) / parseInt(this.state.pace)) * 1609.34;
      }
    }
  } /* convertToMeters() */

  /* Converts given Distance to displayable distance */
  convertToDisplayDistance(distance) {
    if (this.state.unitType === 'kilometers') {
      this.setState({routeDistance : ((parseInt(distance) / 1000) + " km") });
    } else {
      //convert meters to miles
      this.setState({routeDistance : ((parseInt(distance) * 0.000621371) + " miles")});
    }
  } /* convertToDisplayDistance() */

  /* clears the map object and resets directions variables */
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
  } /* clearMap */

  /* adds listeners to add waypoints */
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
  } /* addWaypoints */

  /* Run algorithm with user inputted data */
  runAlgorithmWithData = () => {

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
  } /* runAlgorithmWithData */

  /* Handles when Enter is pressed */
  handleEnter = (e) => {
    e.preventDefault();
    if (!this.state.distance && (!this.state.pace && !this.state.time)) {
        alert('Please add either a distance or pace and time!')
        return
    }

    this.runAlgorithmWithData()
  } /* handleEnter */

  /* Changes type of user inputted units */
  handleChangeUnit = (e) => {
    // e.preventDefault();
    if (this.state.units === 'Distance (Kilometers)') {
        this.setState({ units: 'Distance (Miles)' })
        this.setState({ unitType: 'miles' })
    } else {
      this.setState({ units: 'Distance (Kilometers)' })
      this.setState({ unitType: 'kilometers' })
    }
  } /* handleChangeUnit */

  /* Clears map when clear button is pressed */
  handleClear = () => {
    this.clearMap()
  } /* handleClear */

  /* When Waypoints button is pressed, wait for waypoints */
  handleWaypoints = () => {
    this.addWaypoints()
  } /* handleWaypoints */

  /* HTML to be rendered */
  render() {
    //console.log(this.state.m)
    return (
      
      <div>
        <div>
          {/* <Input onPress={ (data, e) => this.runAlgorithmWithData(data, e) }
                 onClear={this.clearMap}
                 onWaypoints={this.addWaypoints}/> */}
          <div className='map-inputs'>
            <div>
                <input className='input-field' name='distance' value={this.state.distance} onChange={(e) => this.setState({ distance: e.target.value })} type='text' placeholder={this.state.units} />
                <h1 className='input-text'>OR</h1>
            </div>
            <div>
                <input className='input-field' name='pace' value={this.state.pace} onChange={(e) => this.setState({ pace: e.target.value })} type='text' placeholder='Pace (minutes/mile)' />
                <input className='input-field' name='time' value={this.state.time} onChange={(e) => this.setState({ time: e.target.value })} type='text' placeholder='Time (minutes)' />
            </div>
            <div>
                <input className='input-field' name='addr' value={this.state.addr} onChange={(e) => this.setState({ addr: e.target.value })} type='text' id='addy' placeholder='Address' />
            </div>
            <Button buttonStyle='btn--input' onClick={(e) => this.handleEnter(e)}>
                Enter
            </Button>
            <Button buttonStyle='btn--input' onClick={(e) => this.handleChangeUnit(e)}>
                Change Units
            </Button>
            <Button buttonStyle='btn--input' onClick={this.handleClear}>
                Clear
            </Button>
            <Button buttonStyle='btn--input' onClick={this.handleWaypoints}>
                Waypoints
            </Button>
        </div>
          <h1>{this.state.routeDistance}</h1>
        </div>
        <div>
          <main id="map" role="application"></main>
          <div id="elevation_chart"></div>
          <div id="pano"></div>
        </div>
      </div>
    )
  }
} /* NewMap */

export default withStyles(styles)(NewMap);