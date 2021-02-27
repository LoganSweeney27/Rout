//import logo from './logo.svg';
import Header from './components/Header'
import Map from './components/Map' // import the map here

const location = {
  address: '610 Purdue Mall, West Lafayette, IN 47907',
  lat: 40.4237,
  lng: -86.9212,
} // location for google map api

function App() {
  return (
    <div className='container'>
      <Header /*title='Username'*//>
      <Map location={location} zoomLevel={16} />
    </div>
  );
}

export default App;
