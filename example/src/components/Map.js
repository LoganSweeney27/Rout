import React from 'react'
import GoogleMapReact from 'google-map-react'
import { Icon } from '@iconify/react'
import locationIcon from '@iconify/icons-mdi/map-marker'
import './map.css'
import { Loader } from "@googlemaps/js-api-loader"
const { compose, withProps, lifecycle } = require("recompose");
const google = window.google = window.google ? window.google : {}
const {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  DirectionsRenderer,
} = require("react-google-maps");
const loader = new Loader({
  apiKey: "AIzaSyDaeI3wL3hzchjY5e6b9KjG_MgK4cQVuYU",
  version: "weekly",
});
// var script = document.createElement('script');
// script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDaeI3wL3hzchjY5e6b9KjG_MgK4cQVuYU&callback=initMap';
// script.async = true;

const LocationPin = ({ text }) => (
  <div className="pin">
    <Icon icon={locationIcon} className="pin-icon" />
    <p className="pin-text">{text}</p>
  </div>
)

// const Map = ({ location, zoomLevel }) => (
//   <div className="map">
//     <h2 className="map-h2">Your Location</h2>

//     <div className="google-map">
//       <GoogleMapReact
//         bootstrapURLKeys={{ key: "AIzaSyDaeI3wL3hzchjY5e6b9KjG_MgK4cQVuYU" }}
//         defaultCenter={location}
//         defaultZoom={zoomLevel}
//       >
//         <LocationPin
//           lat={location.lat}
//           lng={location.lng}
//           text={location.address}
//         />
//       </GoogleMapReact>
//     </div>
//   </div>
// )
var markers = [];
let waypts = [];
let startPoint;
let wayptOn = false;


const Map = compose(
  withProps({
    googleMapURL: "https://maps.googleapis.com/maps/api/js?key=AIzaSyDaeI3wL3hzchjY5e6b9KjG_MgK4cQVuYU&v=3.exp&libraries=geometry,drawing,places",
    loadingElement: <div style={{ height: `100%` }} />,
    containerElement: <div style={{ height: `400px` }} />,
    mapElement: <div style={{ height: `100%` }} />,
  }),
  withScriptjs,
  withGoogleMap,
  lifecycle({
    componentDidMount() {





      const DirectionsService = new google.maps.DirectionsService();

      DirectionsService.route({
        origin: "West Lafayette, IN",
        destination: "Chicago",
        waypoints:waypts,
        travelMode: google.maps.TravelMode.WALKING,
        avoidHighways: false,
      }, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          this.setState({
            directions: result,
          });
        } else {
          console.error(`error fetching directions ${result}`);
        }
      });
    }
  })
)(props =>
  <GoogleMap
    defaultZoom={7}
    defaultCenter={new google.maps.LatLng(41.8507300, -87.6512600)}
  >
    {props.directions && <DirectionsRenderer directions={props.directions} draggable={true} />}
  </GoogleMap>
);

export default Map

function newCoordinatesLocation(lat, lng, distance, direction) {
  direction = (direction * 180) / Math.PI;
  lat = lat + (distance * Math.cos(direction) / 111111);
  lng = lng + (distance * Math.sin(direction) / Math.cos(lat) / 111111);
  let latlng = new google.maps.LatLng(lat, lng);
  return latlng;
}


function addMarker(location, map) {
  const marker = new google.maps.Marker({
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