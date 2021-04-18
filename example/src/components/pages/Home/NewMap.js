import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import './NewMap.css'
import { Button } from '../../Button';
import Details from './Details';
import UserStore from '../Login/Stores/UserStore';
import Modal from "react-modal"

import './Input.css'

let startPoint = null;
let wayptOn = false;
let markers = [];
let waypts = [];
let elevationDiff = 0;
Modal.setAppElement("#root");

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

  elevationDiff = findHilliness(elevations);

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




/* Takes in an address string and uses a geocoder to convert into a latLng object */
function geocodeAddr(geocoder, addr) {
  //const addr = document.getElementById("addr");
  geocoder.geocode({address: addr}, (results, status) => {
    if (status == "OK") {
      startPoint = results[0].geometry.location;
    } else {
      /*alert(
        "Address geocoding was not successful for the following reason: " + status
      );*/
    }
  });
}

/* Function to convert a distance (km) and time (min) into a pace */
function calcPace(distance, time) {
  distance = distance * 0.000621371;
  var pace = time / distance;
  /*if (Number.isInteger(pace)) {
    return pace;
  } else {
  }*/
  return pace;
}

/* Function to quantify the hilliness of a route */
function findHilliness(arr) {
  var prevElevation = arr[0].elevation;
  var climb = 0;
  var drop = 0;
  var max = 0;
  var min = Number.MAX_SAFE_INTEGER;
  var diff = 0;
  for (var i = 1; i < arr.length; i++) {
    diff = arr[i].elevation - prevElevation;
    prevElevation = arr[i].elevation;
    if (diff > 0) {
      climb += diff;
      climb = Math.abs(climb / 1);
    }
    else {
      drop -= diff;
      drop = Math.abs(drop / 1);
    }
    if (arr[i].elevation > max) {
      max = arr[i].elevation;
    }
    if (arr[i].elevation < min) {
      min = arr[i].elevation;
    }
  }
  diff = max - min;
  return diff;
};

/* Function to calculate the difficulty of a route, based on distance and hilliness */
function calcDifficulty(distance, hilliness) {
  distance = distance / 1000;
  var score = 0;
  var tempDistance = 0
  var tempHilliness = 0;
  tempDistance = distance / 3.5;
  if (tempDistance > 5) {
    tempDistance = 5;
  }
  tempHilliness = hilliness / 15;
  if (tempHilliness > 5) {
    tempHilliness = 5;
  }
  score = tempDistance + tempHilliness;
  return score;
}

/* NewMap class defines map and all functions that go with it
  It also displays the map and the directions */
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
      uniqueCode:null,
      d_renderer1:null,
      d_renderer2:null,
      d_renderer3:null,
      d_geocoder:null,
      my_map:null, //Map object
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
	  showModal: false,
      elevationDiff: 0,
    }

	this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.initMap = this.initMap.bind(this)
    this.lastDirections = null;
  }

  /* Runs after component is mounted, initalizes Map and algorithm */
  componentDidMount(){
    this.loadGoogleMapScript();
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


      if (this.state.my_map == null) {
        this.setState({my_map: map});
        
      }
      // Create A Map use window so the browser can access it
      //const map = this.state.my_map;

      if (this.state.d_renderer1 == null) {
        const directionsRenderer1 = new window.google.maps.DirectionsRenderer({
          draggable: true,
          map,
        }); 
        this.setState({d_renderer1 : directionsRenderer1});
      }
      if (this.state.d_renderer2 == null) {
        const directionsRenderer2 = new window.google.maps.DirectionsRenderer({
          draggable: true,
          map,
        }); 
        this.setState({d_renderer2 : directionsRenderer2});
      }
      if (this.state.d_renderer3 == null) {
        const directionsRenderer3 = new window.google.maps.DirectionsRenderer({
          draggable: true,
          map,
        }); 
        this.setState({d_renderer3 : directionsRenderer3});
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


    
    
    // this.setState({ wasCreated: this.createRoute(start, error, distance, 0) });
    this.createRoute(start, error, distance, 0, Math.random() * 2 * Math.PI, 0);
    setTimeout(() => {
      if (this.state.wasCreated) {
        this.pushRoute()
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
      }
      
    }, 2000);

        
  } /* myCalculateAndDisplayRoute() */

  /* Recursive function to find route of specified distance */
  createRoute(start, error, distance, depth, beginDirection, multi) {
    console.log("test1");
    if (multi > 2) {
      return;
    }

    if (depth > 8) {
      alert("Could not find route at this starting point.");
      this.setState({ wasCreated: false });
      return;
    }

    var directionsService = this.state.d_service;
    var directionsRenderer1 = this.state.d_renderer1;
    var directionsRenderer2 = this.state.d_renderer2;
    var directionsRenderer3 = this.state.d_renderer3;
    var map = this.state.my_map;

    directionsRenderer1.setOptions({
      polylineOptions: {
        strokeWeight: 4,
        strokeOpacity: 0.8,
        strokeColor: "blue"
      },
      markerOptions:{
        icon:{
            scale: 3,
            strokeColor: "blue"
        }
      }
    });
    directionsRenderer2.setOptions({
      polylineOptions: {
        strokeWeight: 4,
        strokeOpacity: 0.8,
        strokeColor: "green"
      },
      markerOptions:{
        icon:{
            scale: 3,
            strokeColor: "green"
        }
      }
    });
    directionsRenderer3.setOptions({
      polylineOptions: {
        strokeWeight: 4,
        strokeOpacity: 0.8,
        strokeColor: "red"
      },
      markerOptions:{
        icon:{
            scale: 3,
            strokeColor: "red"
        }
      }
    });

    if (!wayptOn) {
      waypts = [];
      let loc = 0; //newCoordinatesLocation(start.lat(), start.lng(), distance / 2, 0);
      if (multi == 0) {
        //alert("multi is 0");
        loc = newCoordinatesLocation(start.lat(), start.lng(), distance / 2,
                                     beginDirection + (depth * (Math.PI / 4)));
      }
      else if (multi == 1) {
        //alert("multi is 1");
        /*alert("begin direction at multi 1 = " + beginDirection);
        alert("depth at multi 1 = " + depth);*/
        loc = newCoordinatesLocation(start.lat(), start.lng(), distance / 2,
                                     beginDirection + (depth * (Math.PI / 4)));
      }
      else if (multi == 2) {
        //alert("multi is 2");
        /*alert("begin direction at multi 2 = " + beginDirection);
        alert("depth at multi 2 = " + depth);*/
        loc = newCoordinatesLocation(start.lat(), start.lng(), distance / 2,
                                     beginDirection + (depth * (Math.PI / 4)));
      }

      //clears waypoints array so that multiple routes can be created
      waypts.length = 0;
      
      //addMarker(loc, this.state.my_map);
      
      waypts.push({
          location: loc,
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
              console.log(parseFloat(distance) + parseFloat(error));
              console.log(totaldistance);
              if (((parseFloat(distance) + parseFloat(error)) > totaldistance)
                  && ((parseFloat(distance) - parseFloat(error)) < totaldistance)) {
                console.log("test");
                if (multi == 0) {
                  //alert("depth at multi 0 = " + depth);
                  if (!wayptOn) {
                      directionsRenderer1.setDirections(response);
                      this.lastDirections = response;
                      directionsRenderer1.setMap(map);

                  } else if (wayptOn && (totaldistance <= distance)) {
                      directionsRenderer1.setDirections(response);
                      this.lastDirections = response;
                      directionsRenderer1.setMap(map);

                  } else {
                      window.alert("WAYPOINTS TOO FAR AWAY, CLEAR AND TRY AGAIN")
                      this.setState({ wasCreated: false });
                  }
                }
                else if (multi == 1) {
                  //alert("depth at multi 1 = " + depth);
                  if (!wayptOn) {
                      directionsRenderer2.setDirections(response);
                      this.lastDirections = response;
                      directionsRenderer2.setMap(map);

                  } else if (wayptOn && (totaldistance <= distance)) {
                      directionsRenderer2.setDirections(response);
                      this.lastDirections = response;
                      directionsRenderer2.setMap(map);

                  } else {
                      window.alert("WAYPOINTS TOO FAR AWAY, CLEAR AND TRY AGAIN")
                      this.setState({ wasCreated: false });
                  }
                }
                else if (multi == 2) {
                  //alert("depth at multi 2 = " + depth);
                  if (!wayptOn) {
                      directionsRenderer3.setDirections(response);
                      this.lastDirections = response;
                      directionsRenderer3.setMap(map);

                  } else if (wayptOn && (totaldistance <= distance)) {
                      directionsRenderer3.setDirections(response);
                      this.lastDirections = response;
                      directionsRenderer3.setMap(map);

                  } else {
                      window.alert("WAYPOINTS TOO FAR AWAY, CLEAR AND TRY AGAIN")
                      this.setState({ wasCreated: false });
                  }
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
                this.createRoute(start,error,distance, 0, 0, ++multi);
                return;
              } else {
                this.createRoute(start,error,distance, ++depth, 0, multi);
              }
  
          } else {
              window.alert("Directions request failed due to " + status);
              this.setState({ wasCreated: false });
          }
          multi++;
      }
    );
  }
  
  async saveRoute() {
	if (this.state.wasCreated) {
	  this.pushRoute();
	} else {
	  alert("Please create a route first!");
	}
  }
  
  async loadRoute() {
    /*if (this.state.uniqueCode != null) {
      try {
      let res = await fetch('/getResponseByCode', {
        method: 'post',
        headers: {
            'Accept': 'application/json',
            'Content-type': 'application/json'
        },
        body: JSON.stringify({
          uniqueCode: this.state.uniqueCode
        })
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
    } else {
      if (this.lastDirections == null) {
        alert("lastDirections is null!");
      }
      else {
        this.clearMap();
        this.state.d_renderer.setMap(this.state.my_map);
      }
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
              //If successful set response object
              this.setState({ loadRoute: result.response })
          } else {
              alert("Could not get route response object.");
          }
      } catch(e) {
          console.log(e)
      }
  }*/
    
	
	
	
  }
    
  async propagateTable() {
	  
	  let table = document.getElementById("saved-routes-table");
	  
	  try {
		
		let res = await fetch('/getRoutesUsername', {
			method: 'post',
			headers: {
			  'Accept': 'application/json',
			  'Content-Type': 'application/json'
			},
			body: JSON.stringify({
			  username: UserStore.username
			})
		});
		
		let result = await res.json();
		if (result && result.success) {
		  for(let i = 0; i < result.responseCount; i++) {
			let row = table.insertRow(i);
			
			let dateCell = row.insertCell(0);
			let distanceCell = row.insertCell(1);
			let difficultyCell = row.insertCell(2);
			let caloriesCell = row.insertCell(3);
			let locationCell = row.insertCell(4);
			let codeCell = row.insertCell(5);
			
			dateCell.innerHTML = result.dates[i];
			distanceCell.innerHTML = parseInt(result.distances[i]) + " m";
			difficultyCell.innerHTML = result.difficulties[i];
			caloriesCell.innerHTML = result.calories[i];
			locationCell.innerHTML = result.locations[i];
			codeCell.innerHTML = result.codes[i];
		  }
		  
		  
		  
		} else {
		  alert("Something went wrong :(");
		  this.closeModal();
		}
		
	  } catch (e) {
		alert(e);
	  }
	  
  }
  
  handleSelection(e) {
	let selected = e.target.parentNode.parentNode.getElementsByClassName('selected');
	if (selected.item(0)) { selected.item(0).classList.remove('selected'); }
	e.target.parentNode.classList.add('selected');
  }

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

    this.state.d_renderer1.setDirections(null);
    this.state.d_renderer1.setMap(null);
    this.state.d_renderer2.setDirections(null);
    this.state.d_renderer2.setMap(null);
    this.state.d_renderer3.setDirections(null);
    this.state.d_renderer3.setMap(null);
    //this.state.my_map.setCenter(40.4259, -86.9081);
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

    const address = document.getElementById("addy");
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


  /* Handles when Enter is pressed */
  handleEnter = (e) => {
    e.preventDefault();
    if (!(this.state.hasDistance || (this.state.hasPace && this.state.hasTime))) {
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

  handleSave = () => {
	  this.saveRoute();
  }

  handleLoad = () => {
	this.openModal();
  }
  
  openModal() {
	this.setState({ showModal: true });
  }
  
  closeModal() {
	this.setState({ showModal: false });
	
  }

  render() {
    return (
      <div>
        <div>
          <div className='map-inputs'>
            <div>
                <input className='input-field' name='addr' value={this.state.addr} onChange={(e) => {this.setState({ addr: e.target.value }); UserStore.address = e.target.value}} type='text' id='addy' placeholder='Address' />
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
			  {UserStore.isLoggedIn == true && <Button buttonStyle='btn--input' onClick={this.handleSave}>Save</Button>}
			  {UserStore.isLoggedIn == true && <Button buttonStyle='btn--input' onClick={this.handleLoad}>Load</Button>}
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
          <div id="pano"></div>
        </div>
        <div>
        {this.state.showDetails && <Details routeDistance={this.state.routeDistance} time={this.state.final_time} pace={this.state.final_pace} calories={this.state.calories} difficulty='3' address={this.state.addr} routeID={this.state.routeID}/>}
            <div className='details-btn'>
                <Button buttonStyle='btn--details' onClick={() => this.setState({ showDetails: (!this.state.showDetails) })}>
                    Details ^
                </Button>
            </div>
        </div>
		<Modal 
		  isOpen={this.state.showModal}
		  className="modal-box"
		  onAfterOpen={this.propagateTable}
		  overlayClassName="modal-overlay"
		  closeTimeoutMS={500}
		>
			<h2 class="center">Select a route to load</h2>
			<br />
			<table cellspacing="0" class="center">
				<tr>
					<th>Date</th>
					<th>Distance</th>
					<th>Difficulty Score</th>
					<th>Calories</th>
					<th>Location</th>
					<th>Sharing Code</th>
				</tr>
			</table>
			<table id="saved-routes-table" cellspacing="0" class="center" onClick={(e) => this.handleSelection(e)}>
				<tr>
				</tr>
			</table>
			<br />
      <InputField
              type='text'
              placeholder='Unique Route Code'
              value={this.state.uniqueCode ? this.state.uniqueCode : ''}
              onChange={ (val) => this.setState({
                uniqueCode: val
              })}
              />
      
			<br />
			<button id="modal-btn" onClick={this.closeModal}>Confirm</button>

		</Modal>


      </div>
    

    )
  }
} /* NewMap */

export default withStyles(styles)(NewMap);