import React, { Component, useState } from 'react';
import { withStyles } from '@material-ui/core/styles';
import './NewMap.css'
import Input from './Input';


const styles = {
  root: {
    flexGrow: 1,
  },
  
};
let startPoint;
let wayptOn = false;
let markers = [];
let waypts = [];

class NewMap extends Component {


  constructor(props){
    super(props);
    this.state ={
      mapIsReady:false,
      query:"",
      places:[],
      filtered:[],
      m:[],
      routeDistance:"",
      d_service:null,
      d_renderer:null,
      my_map:null,
    }

    this.updateQuery = this.updateQuery.bind(this);
    this.initMap = this.initMap.bind(this)

  }

  componentWillMount() {
    this.loadGoogleMapScript();
    
  }
  componentDidMount(){

    window.gm_authFailure = this.gm_authFailure;

    //we load the google map script when its ready
    //we get the venues when they are ready
    //this.getVenues()
    
  }

  loadGoogleMapScript(){
    const ApiKey = 'AIzaSyDekWG_GZBqJ3j0Kt9t-B0ayBcU9wLHlsk'

    const script = window.document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${ApiKey}`
    script.async = true;
    script.defer= true;
    script.onerror = function(){window.alert("The Google Maps API failed to load data!")}
    
    //this is a callback to wait until the code has loaded
    script.addEventListener('load', () =>{
      this.setState({mapIsReady:true})
    });
    window.document.body.appendChild(script)

  }

  componentDidUpdate(){
   //once the script is uploaded to the window load up the map 
    
    if (this.state.my_map == null) {
      this.initMap()
    }
  }



  //create markers
  initMap(){
    //if map is ready to load
    if(this.state.mapIsReady){
    const map = new window.google.maps.Map(document.getElementById('map'), {
      center: {lat: 40.4259, lng: -86.9081},
      zoom: 13,
    });
    if (this.state.my_map == null) {
      this.setState({my_map: map});
    }
    // Create A Map use window so the browser can access it
    //const map = this.state.my_map;
    const directionsService = new window.google.maps.DirectionsService();
    const directionsRenderer = new window.google.maps.DirectionsRenderer({
      draggable: true,
      map,
    }); 
    if (this.state.d_renderer == null) {
      this.setState({d_renderer : directionsRenderer});
    }
    if (this.state.d_service == null) {
      this.setState({d_service : directionsService});
    }

          
    
  //create markers




  var startPointListener = map.addListener("click", (event) => {
    addMarker(event.latLng, map);
    startPoint = event.latLng;
    window.google.maps.event.removeListener(startPointListener);
    // while (this.state.routeDistance == "") {
    //   //console.log("waiting");
    // }
  });
  
  }//end of if statement

  }


  updateQuery = (query) =>{
    this.setState({
      query:query
    })
    this.updateSearchedPlaces(query)
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
clearMap = () => {
  window.alert("clearing map");
  this.state.d_renderer.setDirections(null);
  this.state.d_renderer.setMap(null);
  deleteMarkers();
  startPoint = null;
  waypts = [];
  wayptOn = false;
  //initStartListener(map);
}
addData = (data, e) => {
  //alert(e);
  //e.preventDefault();
  console.log(data)
  console.log(data.distance)
  //this.setState({routeDistance: data.distance});
  myCalculateAndDisplayRoute(startPoint, data.distance, this.state.d_service, this.state.d_renderer, this.state.my_map);

} 

  render() {
    //console.log(this.state.m)
    return (
      
      <div>
          <Input onPress={ (data, e) => this.addData(data, e) } onClear={this.clearMap}/>
          {/* <h1>{this.state.routeDistance}</h1> */}
          <main id="map" role="application"></main>
      </div>
    )
  }
}

export default withStyles(styles)(NewMap);


function addMarker(location, map) {
  const marker = new window.google.maps.Marker({
      position: location,
      map: map,
  });
  //markers.push(marker);
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


function myCalculateAndDisplayRoute(
  start,
  distance,
  directionsService,
  directionsRenderer,
  map,
) {

  // ts-ignore
  //var distance = 5000//document.getElementById("distance").value;
//   if (map == null) {
// console.log("problem");
//   }
  //add marker at a location a given distance away
  //addMarker( {lat: 40.4259, lng: -86.9081}, map);
  new window.google.maps.Marker({
      position: newCoordinatesLocation(start.lat(), start.lng(),
          distance/2, 90),
      map,
  });
  console.log("added marker");
  //add that location as a waypoint
  if (!wayptOn) {
      distance = distance / 2;
      waypts.push({
          location: newCoordinatesLocation(start.lat(), start.lng(),
              distance, 90),
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
              var totaldistance = 0;

              for (let i = 0; i < route.legs.length; i++) {
                  totaldistance += route.legs[i].distance.value;
              }
              console.log(totaldistance);
              // directionsRenderer.setDirections(response);
              // directionsRenderer.setMap(map);
              if (!wayptOn) {
                  directionsRenderer.setDirections(response);
                  directionsRenderer.setMap(map);
                  // const summaryPanel = document.getElementById(
                  //     "directions-panel"
                  // ) as HTMLElement;
                  // summaryPanel.innerHTML = "";
                  // for (let i = 0; i < route.legs.length; i++) {
                  //     const routeSegment = i + 1;

                  //     summaryPanel.innerHTML += route.legs[i].distance!.text + "<br><br>";
                  // }
              } else if (wayptOn && (totaldistance <= distance)) {
                  directionsRenderer.setDirections(response);
                  directionsRenderer.setMap(map);
                  // const summaryPanel = document.getElementById(
                  //     "directions-panel"
                  // ) as HTMLElement;
                  // summaryPanel.innerHTML = "";
                  // for (let i = 0; i < route.legs.length; i++) {
                  //     const routeSegment = i + 1;

                  //     summaryPanel.innerHTML += route.legs[i].distance!.text + "<br><br>";
                  // }
              } else {
                  window.alert("WAYPOINTS TOO FAR AWAY, CLEAR AND TRY AGAIN")
              }

          } else {
              window.alert("Directions request failed due to " + status);
          }
      }
  );
}

function newCoordinatesLocation(lat, lng, distance, direction) {
  direction = (direction * 180) / Math.PI;
  lat = lat + (distance * Math.cos(direction) / 111111);
  lng = lng + (distance * Math.sin(direction) / Math.cos(lat) / 111111);
  let latlng = new window.google.maps.LatLng(lat, lng);
  return latlng;
}