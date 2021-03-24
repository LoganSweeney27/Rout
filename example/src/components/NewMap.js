import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import './NewMap.css'



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
      m:[]
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
      this.initMap()
    }



  //create markers
  initMap(){
    //if map is ready to load
    if(this.state.mapIsReady){

    // Create A Map use window so the browser can access it
    const map = new window.google.maps.Map(document.getElementById('map'), {
      center: {lat: 40.4259, lng: -86.9081},
      zoom: 13
    });
    const directionsService = new window.google.maps.DirectionsService();
    const directionsRenderer = new window.google.maps.DirectionsRenderer({
      draggable: true,
      map,
    })    
          
    
  //create markers




  var startPointListener = map.addListener("click", (event) => {
    addMarker(event.latLng, map);
    startPoint = event.latLng
    window.google.maps.event.removeListener(startPointListener);
    myCalculateAndDisplayRoute(startPoint, directionsService, directionsRenderer, map);
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



  render() {
    //console.log(this.state.m)
    return (
      <div>
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


function myCalculateAndDisplayRoute(
  start,
  directionsService,
  directionsRenderer,
  map,
) {

  // @ts-ignore
  var distance = 5000//document.getElementById("distance").value;

  //add marker at a location a given distance away
  new window.google.maps.Marker({
      position: newCoordinatesLocation(start.lat(), start.lng(),
          distance/2, 90),
      map,
  });
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