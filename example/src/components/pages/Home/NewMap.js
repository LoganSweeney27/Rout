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
      chartIsReady:false,
      places:[],
      filtered:[],
      m:[],
      routeDistance:"",
      d_service:null,
      d_renderer:null,
      my_map:null,
    }

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

    const scriptMap = window.document.createElement('script')
    scriptMap.src = `https://maps.googleapis.com/maps/api/js?key=${ApiKey}`
    scriptMap.async = true;
    scriptMap.defer= true;
    scriptMap.onerror = function(){window.alert("The Google Maps API failed to load data!")}

    const scriptChart = window.document.createElement('script')

    scriptChart.src = 'https://www.gstatic.com/charts/loader.js'
    // scriptChart.async = true;
    // scriptChart.defer = true;
    scriptChart.onerror = function(){window.alert("The Google Charts API failed to load data!")}

    //this is a callback to wait until the code has loaded
    scriptMap.addEventListener('load', () =>{
      this.setState({mapIsReady:true})
      

    });
    scriptChart.addEventListener('load', () => {
      if (this.state.mapIsReady) {
        window.google.charts.load('current', {packages: ['corechart']});
        this.setState({chartIsReady:true});

      }
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

    listenforStart(map);
  
  
  }//end of if statement

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
  //window.alert("clearing map");
  this.state.d_renderer.setDirections(null);
  this.state.d_renderer.setMap(null);
  deleteMarkers();
  startPoint = null;
  waypts = [];
  wayptOn = false;
  listenforStart(this.state.my_map);
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
          <div id="elevation_chart"></div>
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
  addMarker(newCoordinatesLocation(start.lat(), start.lng(), distance/2, 90), map);

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
              const elevator = new window.google.maps.ElevationService();

                    // Draw the path, using the Visualization API and the Elevation service.
                    displayPathElevation(route.overview_path, elevator, map);

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

function displayPathElevation(
  path,
  elevator,
  map
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