import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import './NewMap.css'
import { Button } from '../../Button';
import Details from './Details';
import UserStore from '../Login/Stores/UserStore';

import './Input.css'

let startPoint = null;
let wayptOn = false;
let markers = [];
let waypts = [];
let elevationDiff = 0;

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




/* Listens for starting marker to be placed */
function listenforStart(map) {
  var startPointListener = map.addListener("click", (event) => {
    addMarker(event.latLng, map);
    startPoint = event.latLng;
    window.google.maps.event.removeListener(startPointListener);

  });
} /* listenforStart() */








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



/* NewMap class defines map and all functions that go with it
  It also displays the map and the directions */
class NewMap extends Component {
  constructor(props) {
    super(props);

    var today = new Date(),
      mdy = (today.getMonth() + 1) + "/" + today.getDate() + "/" + today.getFullYear();

    this.state = {
      mapIsReady: false,
      chartIsReady: false,
      routeDistance: "", //distance of the produced route
      routeDistance_m: '', //distance of real produced route in distance
      d_autocomplete: null,
      d_service:null,
      d_renderer1:null,
      d_renderer2:null,
      d_renderer3:null,
      d_geocoder:null,
      my_map:null, //Map object
      wayptListener:null,
      addr: '',
      distance: '', //inputted distance, could be in miles or kilometers
      distance_m: '', //distance in meters
      pace: '',
      time: '',
      final_time: '',
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
      hillsType: 0, //want any route, hilly route, or less hilly rout (0, 1, 2) respectively
      hasDistance: false,
      hasPace: false,
      hasTime: false,
      elevationDiff: 0,
      difficulty: 0,
      compTime: null,
      changeInAlt:0,
    }

    this.initMap = this.initMap.bind(this)
    this.lastDirections = null;
    this.savedDirections = null;
  }

  /* Runs after component is mounted, initalizes Map and algorithm */
  componentDidMount() {
    this.loadGoogleMapScript();
    window.gm_authFailure = this.gm_authFailure;

    //we load the google map script when its ready
    //we get the venues when they are ready
    //this.getVenues()

  } /* componentDidMount() */

  /* Loads information for Google Maps API */
  loadGoogleMapScript() {
    const ApiKey = 'AIzaSyDekWG_GZBqJ3j0Kt9t-B0ayBcU9wLHlsk'

    const scriptMap = window.document.createElement('script')
    scriptMap.src = `https://maps.googleapis.com/maps/api/js?key=${ApiKey}&libraries=places`
    scriptMap.async = true;
    scriptMap.defer = true;
    scriptMap.onerror = function () { window.alert("The Google Maps API failed to load data!") }

    const scriptChart = window.document.createElement('script')

    scriptChart.src = 'https://www.gstatic.com/charts/loader.js'
    scriptChart.onerror = function () { window.alert("The Google Charts API failed to load data!") }

    //this is a callback to wait until the code has loaded
    scriptMap.addEventListener('load', () => {
      this.setState({ mapIsReady: true })
      scriptChart.addEventListener('load', () => {
        if (this.state.mapIsReady) {
          window.google.charts.load('current', { packages: ['corechart'] });
          this.setState({ chartIsReady: true });
          this.initMap()
        }
      });

    });

    window.document.body.appendChild(scriptMap)
    window.document.body.appendChild(scriptChart);
  } /* loadGoogleMapScript() */


  // /* when component is updated, upload map */
  // componentDidUpdate() {
  //   //once the script is uploaded to the window load up the map 

  //   if (this.state.my_map == null) {
  //     this.initMap()
  //   }
  // } /* componentDidUpdate() */



  /* this function initializes the map and prepares*/
  initMap() {
    //if map is ready to load
    if (this.state.mapIsReady && this.state.chartIsReady) {
      const map = new window.google.maps.Map(document.getElementById('map'), {
        center: { lat: 40.4259, lng: -86.9081 },//{lat: 40, lng: -105},//{
        zoom: 13,
      });


      if (this.state.my_map == null) {
        this.setState({ my_map: map });

      }
      // Create A Map use window so the browser can access it
      //const map = this.state.my_map;

      if (this.state.d_renderer1 == null) {
        const directionsRenderer1 = new window.google.maps.DirectionsRenderer({
          draggable: true,
          map,
        }); 
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
        this.setState({d_renderer1 : directionsRenderer1});
      }

      if (this.state.d_renderer2 == null) {
        const directionsRenderer2 = new window.google.maps.DirectionsRenderer({
          draggable: true,
          map,
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
        this.setState({d_renderer2 : directionsRenderer2});
      }

      if (this.state.d_renderer3 == null) {
        const directionsRenderer3 = new window.google.maps.DirectionsRenderer({
          draggable: true,
          map,
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
        this.setState({d_renderer3 : directionsRenderer3});
      }
      if (this.state.d_service == null) {
        const directionsService = new window.google.maps.DirectionsService();
        this.setState({ d_service: directionsService });
      }
      if (this.state.d_geocoder == null) {
        const geocoder = new window.google.maps.Geocoder();
        this.setState({ d_geocoder: geocoder });
      }
      if (this.state.d_autocomplete == null) {
        const autocomplete = new window.google.maps.places.Autocomplete(document.getElementById("addy"));
        this.setState({d_autocomplete: autocomplete})
      }
      

      listenforStart(map);
    }//end of if statement

  } /* initMap() */

  /* Calculates and displays route, also updates route state
    for directions result */
  myCalculateAndDisplayRoute(
    start,
    distance,
    error,
  ) {
    console.log("added marker");
    //add that location as a waypoint

    var totaldistance = 0;
    //var counter = 0;
    console.log("distance : " + distance); //3000
    console.log("totaldistance : " + totaldistance); //0
    //totaldistance = 3500;

    //while distance is not with +-error of request distance
    if (this.state.hillsType == 1) {
      this.setState({changeInAlt : 0});
    } else if (this.state.hillsType == 2) {
      this.setState({changeInAlt : 10000}); // max altitude change

    }

    // this.setState({ wasCreated: this.createRoute(start, error, distance, 0) });
    this.createRoute(start, error, distance, 0, Math.random() * 2 * Math.PI, 0);
    setTimeout(() => {
      //alert("test")
      if (this.state.wasCreated) {
        this.convertToDisplayDistance(this.state.routeDistance_m);
        this.estimate_time(this.state.routeDistance_m); //estimate for final time value
        this.estimate_calories(this.state.routeDistance_m); //estimate for final calories burned
        this.pushRoute()

        //alert(this.state.route)
        if ((this.state.hillsType == 1 )|| (this.state.hillsType == 2)) {
          // this.clearMap();
          this.state.d_renderer1.setDirections(this.state.route);
          this.lastDirections = this.state.route;
          this.state.d_renderer1.setMap(this.state.my_map);
        }
      }

    }, 3000);


  } /* myCalculateAndDisplayRoute() */

  /* Recursive function to find route of specified distance */
  createRoute(start, error, distance, depth, beginDirection, multi) {
    if (multi > 2) {
      return;
    }

    if (depth > 8) {
      if ((this.state.hillsType == 1) || (this.state.hillsType == 2)) { //if working with hills
        this.setState({ wasCreated: true });
        return;
      } else {
        alert("Could not find route at this starting point.");
        this.setState({ wasCreated: false });
        return;
      }
    }

    var directionsService = this.state.d_service;
    var directionsRenderer;
    if (multi == 0) {
      directionsRenderer = this.state.d_renderer1;
    } else if (multi == 1) {
      directionsRenderer = this.state.d_renderer2;
    } else {
      directionsRenderer = this.state.d_renderer3;
    }

    if (!wayptOn) {
      waypts = [];
      let loc = newCoordinatesLocation(start.lat(), start.lng(), distance / 2,
                                     beginDirection + (depth * (Math.PI / 4)));
      

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
      
       async (response, status) => {
        if (status === "OK" && response) {
          const route = response.routes[0];
          let totaldistance = 0;

          for (let i = 0; i < route.legs.length; i++) {
            totaldistance += route.legs[i].distance.value;
          }
          console.log("totaldistance : " + totaldistance);
          console.log("error : " + error);
          console.log("distance : " + distance);
          console.log(parseFloat(distance) + parseFloat(error));
          console.log(totaldistance);
          console.log("DEPTH: " + depth);

          
          if ((((parseFloat(distance) + parseFloat(error)) > totaldistance)
            && ((parseFloat(distance) - parseFloat(error)) < totaldistance))
            || wayptOn) {
              if (this.state.hillsType == 1) {
                this.calculateTotalAltitudeChange(route.overview_path, (totalAltChange) => {
                  if (totalAltChange > this.state.changeInAlt) {
                    this.setState({changeInAlt : totalAltChange});
                    console.log("changing");
                    
                    this.setState({ routeDistance_m: totaldistance })
                    this.setState({ route : response })
                  }
                });
    
              } else if (this.state.hillsType == 2) {
    
                this.calculateTotalAltitudeChange(route.overview_path, (totalAltChange) => {
                  if (totalAltChange < this.state.changeInAlt) {
                    console.log("changing");
                    this.setState({changeInAlt : totalAltChange});
    
                    this.setState({ routeDistance_m: totaldistance })
                    this.setState({ route : response })
                  }
                });

              } else {

                  
                directionsRenderer.setDirections(response);
                //directionsRenderer.setMap(this.state.my_map);

                this.setState({ routeDistance_m: totaldistance })
                this.setState({ route : response })
                this.setState({ wasCreated: true });
                this.createRoute(start,error,distance, 0, Math.random() * 2 * Math.PI, ++multi);
                return;
              }

            }
          //alert(depth);

          //if neither a hilly route nor a non fitting regular, call again

          this.createRoute(start, error, distance, ++depth, beginDirection, multi);

        } else {
          // if (status === "OVER_QUERY_LIMIT") {
          //   console.log("Directions request failed due to " + status);
          // } else {
          window.alert("Directions request failed due to " + status);
          this.setState({ wasCreated: false });
          //}
        }
        multi++;
      }
    );
  } /* createRoute() */


  async calculateTotalAltitudeChange(path, callback) {
    const elevator = new window.google.maps.ElevationService();
    var totalElevationGain = 0;
    await elevator.getElevationAlongPath(
      {
        path: path,
        samples: 50,
      },
      // this.sumElevations
      (elevations, status) => {
        if (status !== "OK") {
          alert("Cannot show elevation: request failed because " + status);
          return;
        }
    
        let bottom = elevations[0].elevation; //max elevation
        let previousElevation = elevations[0].elevation;
        let goingUp = (elevations[1].elevation > elevations[0].elevation);
    
        for (let i = 1; i < elevations.length; i++) {
          //at bottom of slope
          if (elevations[i].elevation > previousElevation) {
            if (!goingUp) {
              goingUp = true;
              bottom = previousElevation;
            }
            // at top of slope
          } else if (elevations[i].elevation < previousElevation) {
            if (goingUp) {
              goingUp = false;
              totalElevationGain += (elevations[i].elevation - bottom);
            }
          }
          previousElevation = elevations[i].elevation;
        }
        callback(totalElevationGain);
      }
    );
  }

  sumElevations(elevations, status) {
    if (status !== "OK") {
      alert("Cannot show elevation: request failed because " + status);
      return;
    }

    let bottom = elevations[0].elevation; //max elevation
    let totalElevationGain = 0;
    let previousElevation = elevations[0].elevation;
    let goingUp = (elevations[1].elevation > elevations[0].elevation);

    for (let i = 1; i < elevations.length; i++) {
      //at bottom of slope
      if (elevations[i].elevation > previousElevation) {
        if (!goingUp) {
          goingUp = true;
          bottom = previousElevation;
        }
        // at top of slope
      } else if (elevations[i].elevation < previousElevation) {
        if (goingUp) {
          goingUp = false;
          totalElevationGain += (elevations[i].elevation - bottom);
        }
      }
      previousElevation = elevations[i].elevation;
    }


    //alert(totalElevationGain)
    return totalElevationGain;
  }
  /* Alerts user to error if Google Map does not load */
  gm_authFailure() {
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
        this.setState({distance_m : (parseInt(this.state.distance) * 1000)})
      } else {
        //conversion from miles to meters
        this.setState({ distance_m : (parseInt(this.state.distance) * 1609.34)})
      }
    } else {
      if ((this.state.pace != null) && (this.state.time != null)) {
        this.setState({ distance_m : (parseInt(this.state.time) / parseInt(this.state.pace)) * 1609.34});
      }
    }
  } /* convertToMeters() */

  /* Converts given Distance to displayable distance */
  convertToDisplayDistance(distance) {
    if (this.state.unitType === 'kilometers') {
      this.setState({ routeDistance: ((parseInt(distance) / 1000) + " km") });
    } else {
      //convert meters to miles
      this.setState({ routeDistance: ((parseInt(distance) * 0.000621371) + " miles") });
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
      this.setState({ wayptListener: null });
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
      this.setState({ wayptListener: myWayptListener });
    }
  } /* addWaypoints */

  /* Run algorithm with user inputted data */
  runAlgorithmWithData = () => {

      /*const addy = document.getElementById("addy");
      alert("addy: " + addy);
      const autocomplete = new window.google.maps.places.Autocomplete(addy);
      alert("newaddy: " + addy);*/

    var fullAddr = null;
    if (this.state.d_autocomplete.getPlace()) {
      fullAddr = this.state.d_autocomplete.getPlace().formatted_address;
    }
    if (fullAddr) {
      this.geocodeAddr(this.state.d_geocoder, fullAddr);
    } else if (startPoint == null) {
      this.geocodeAddr(this.state.d_geocoder, this.state.addr);
    }

    this.convertToMeters();

    //const autocomplete = new window.google.maps.places.Autocomplete(this.state.addr);
    setTimeout(() => {
      if (startPoint) {
        if (this.state.distance_m || wayptOn) {

          //this.setState({routeDistance: data.distance});
          if ((this.state.hillsType == 1) || (this.state.hillsType == 2)) {
            this.myCalculateAndDisplayRoute(startPoint, this.state.distance_m, 1000);
          } else {
            this.myCalculateAndDisplayRoute(startPoint, this.state.distance_m, 400);
          }
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
    } catch (e) {
      console.log(e)
    }
  }

  /* Takes in an address string and uses a geocoder to convert into a latLng object */
  geocodeAddr(geocoder, addr) {
    //const addr = document.getElementById("addr");
    geocoder.geocode({address: addr}, (results, status) => {
      if (status == "OK") {
        startPoint = results[0].geometry.location;
        this.setState({addr: addr});
      } else {
        /*alert(
          "Address geocoding was not successful for the following reason: " + status
        );*/
      }
    });
  }


  estimate_time(distance_m) {
    // 0.00559234 is 9 min/mile as min/meter
    // multiplied by 60 to get in seconds
    if (this.state.compTime != null) {
      this.setState({final_time: this.state.compTime})
    } else {
      this.setState({final_time: (0.00559234 * parseFloat(distance_m) * 60).toFixed(2)});
    }
  }


  estimate_calories(distance) {
    // 0.00062 is the conversion rate from meters to miles
    // 100 is the average calories burned per mile
    this.setState({ calories: (100 * (distance * 0.00062)).toFixed(0) })
  }

  /* Function to calculate the difficulty of a route, based on distance and hilliness */
  calcDifficulty(distance) {
    distance = distance / 1000;
    var score = 0;
    var tempDistance = 0
    var tempHilliness = 0;
    tempDistance = distance / 3.5;
    if (tempDistance > 5) {
      tempDistance = 5;
    }
    tempHilliness = elevationDiff / 2;
    if (tempHilliness > 5) {
      tempHilliness = 5;
    }
    tempDistance = Math.round(tempDistance);
    tempHilliness = Math.round(tempHilliness);
    score = tempDistance + tempHilliness;
    this.setState({ difficulty: score })
  }

  /* Function to convert a distance (m) and time (min) into a pace */
  calcPace() {
    var distance = this.state.routeDistance_m;
    var time = 0;
    if (this.state.compTime != null) {
      time = this.state.compTime;
    } else {
      time = this.state.final_time;
    }
    distance = distance * 0.000621371;
    if (time > 100) {
      time = time / 60;
    }
    var tempPace = time / distance;
    tempPace = Math.round(tempPace * 10) / 10;
    //alert("tempPace = " + tempPace);
    /*if (Number.isInteger(pace)) {
      return pace;
    } else {
    }*/
    this.setState({ final_pace: tempPace })
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
    } catch (e) {
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
    } catch (e) {
      console.log(e)
    }
  }


  /* Handles when Enter is pressed */
  handleEnter = (e) => {
    e.preventDefault();
    if (!(this.state.hasDistance || (this.state.hasPace && this.state.hasTime)) && (!wayptOn)) {
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
    this.loadRoute();
  }

  handlePace = () => {
    this.calcPace();
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
              {!this.state.inputTypes && <input className='input-field' name='distance' value={this.state.distance} onChange={(e) => { this.setState({ distance: e.target.value }); this.setState({ hasDistance: true }) }} type='text' placeholder={this.state.units} />}
              {this.state.inputTypes && <input className='input-field' name='pace' value={this.state.pace} onChange={(e) => { this.setState({ pace: e.target.value }); this.setState({ hasPace: true }) }} type='text' placeholder='Pace (minutes/mile)' />}
              {this.state.inputTypes && <input className='input-field' name='time' value={this.state.time} onChange={(e) => { this.setState({ time: e.target.value }); this.setState({ hasTime: true }) }} type='text' placeholder='Time (minutes)' />}
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
              {(this.state.hillsType == 0) ?
                <Button buttonStyle='btn--input' onClick={() => this.setState({ hillsType: 1 })}>Any</Button> :
                ((this.state.hillsType == 1) ?
                  <Button buttonStyle='btn--input' onClick={() => this.setState({ hillsType: 2 })}>Hills</Button> :
                  <Button buttonStyle='btn--input' onClick={() => this.setState({ hillsType: 0 })}>No Hills</Button>)}

            </div>
            <div>
                {this.state.wasCreated && <input className='input-field' name='compTime' value={this.state.compTime} onChange={(e) => this.setState({ compTime: e.target.value })} type='text' id='compTime' placeholder='Completion Time (min)' />}
                {this.state.wasCreated && <Button buttonStyle='btn--input' onClick={this.handlePace}>
                  Enter Time
                </Button>}
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
          {/* <div id="pano"></div> */}
        </div>
        <div>
          {this.state.showDetails &&
            <Details my_map={this.state.my_map} routeDistance={this.state.routeDistance} time={this.state.final_time}
              pace={this.state.final_pace} calories={this.state.calories} difficulty='3' address={this.state.addr}
              routeID={this.state.routeID} route={this.state.route} />}
          <div className='details-btn'>
            <Button buttonStyle='btn--details' onClick={() => this.setState({ showDetails: (!this.state.showDetails) })}>
              Details ^
                </Button>
          </div>
        </div>
      </div>
    )
  }
} /* NewMap */

export default withStyles(styles)(NewMap);