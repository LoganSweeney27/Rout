import React, { Component } from 'react';
import Header from './Header'
import SearchBar from './SearchBar'
import SideBar from './SearchBar'
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import './NewMap.css'



const styles = {
  root: {
    flexGrow: 1,
  },
  
};

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
  let markers = []
  var startPoint
  let waypts = [];
  //let venues = null;
  //let filtered = this.state.filtered

  //create infowindow
  //et infowindow = new window.google.maps.InfoWindow();

  var startPointListener = map.addListener("click", (event) => {
    addMarker(event.latLng, map);
    startPoint = event.latLng
    window.google.maps.event.removeListener(startPointListener);
    myCalculateAndDisplayRoute(startPoint, directionsService, directionsRenderer, map, false, waypts);
  });
  //console.log(filtered)
  //updateSearchedPlaces function is not working properly
  //it does not changed the state of filtered to this.state.places
  //this if statement is to fix this bug 
  
  // if(filtered.length === 0){
  //   venues = this.state.places
  // }else{
  //   venues = filtered
  // }

  //create markers from venues
  // venues.forEach(place => {
  //     //check to see if there are null values

  //     let name = place.venue.name || 'unknown'
  //     let street = place.venue.location.address || 'unknown'
  //     let city = place.venue.location.formattedAddress[1] || 'unknown'
      


  //     //setup contents for inforwindow
  //     let contentString =  `<div>  <h3>${name}</h3>  <p>${street}</p
  //     ><p>${city} </p></div>`

  //     let marker = new window.google.maps.Marker({
  //       position:{lat:place.venue.location.lat,lng:place.venue.location.lng},
  //       map:map,
  //       id:place.venue.id,
  //       name:place.venue.name,
  //       animation:window.google.maps.Animation.DROP
  //     })
  //     //add eventListener to markers for animation
  //     marker.addListener('click', () => {
  //       if (marker.getAnimation() !== null) { marker.setAnimation(null); }
  //       else { marker.setAnimation(window.google.maps.Animation.BOUNCE); }
  //       setTimeout(() => { marker.setAnimation(null) }, 3000);
  //     });

  //     //add eventListener to markers for infowindow
  //     window.google.maps.event.addListener(marker, 'click', () => {
  //       infowindow.setContent(contentString);
  //       map.setZoom(13);
  //       map.setCenter(marker.position);
  //       infowindow.open(this.map, marker);
  //       map.panBy(0, -125);
  //    });

  //     this.state.m.push(marker)
    
  //   })
    //console.log("mark",markers)
          }//end of if statement

  }


  updateQuery = (query) =>{
    this.setState({
      query:query
    })
    this.updateSearchedPlaces(query)
}

  updateSearchedPlaces = (query) =>{
    //if someone preforms a query
    //check to see if the query-word is in the props.places array

    if(query){
        //the map is updated aschysounsly we have to check if there is an empty array
        //if there are venues that are loaded then we put them in a variable
        let filteredPlaces = this.state.places
            
        //we filter the venue results from foursquare using the filter method
        filteredPlaces = filteredPlaces.filter((place) => {
        
          //change both query and venue name from 4square to lower case to compare
          //if the letters from the query are in the venue then return the results
          let placeName = place.venue.name.toLowerCase().search(query.toLowerCase()) !== -1;

        return placeName
       })

       this.setState({
       filtered: filteredPlaces
       })
    }
    
}





// gm_authFailure(){
//     window.alert("Google Maps error!")
// }


 handleErrors(response) {
  if (!response.ok) {
      throw Error(response.statusText);
  }
  return response;
}

//get places for foursquare
// getVenues(){
  
//   //fetch the function
//   fetch('https://api.foursquare.com/v2/venues/explore?client_id=X1MSP3S2NAEMOOXXBN1JGB2SXSRTHMFALEEQGNJFGOS4JR1K&client_secret=H5F0ZKW53GMOT0EEFDKAS0X3NM30UXS4AQDSVVE2GHU5OGAI&&v=20180323&near=Chicago&query=museum')
//   //body.json() returns a promise it stringifies the response of the api call  
//   .then(this.handleErrors)
//   .then((response) => response.json())
//      .then(data =>{
//         // Code for handling API response
//         this.setState({
//           places:data.response.groups[0].items,
//           filtered:data.response.groups[0].items
//         })
        
  
//      })
//      .catch((err) =>{alert('There is a problem',err)})
   
//   }

  // markerClick = venueID =>{
  //     let findMarker = this.state.m.find(marker => marker.id === venueID);
    
  //     //console.log(venueID)
  //     window.google.maps.event.trigger(findMarker,'click');
  // }


  render() {
    //console.log(this.state.m)
    return (
      <div>

      <Grid container spacing={24}>

        <Grid item xs={12}>
          <Header/>
        </Grid>

        <Grid item xs={12}>
          <SearchBar query={this.state.query} updateQuery ={this.updateQuery}/>
        </Grid>

        <Grid item xs={5} >
          <SideBar places={this.state.filtered} map={this.map} markers={this.state.m} markerClick={this.markerClick}/>
        </Grid>

        <Grid item xs={7}>
          <main id="map" role="application"></main>
        </Grid>

      </Grid>



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
  wayptOn,
  waypts,
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