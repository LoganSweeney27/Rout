import React from 'react';
import Map from './components/Map' // import the map here
import './App.css';
import Navbar from './components/Navbar';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

const location = {
  address: '610 Purdue Mall, West Lafayette, IN 47907',
  lat: 40.4237,
  lng: -86.9212,
} // static location for google map api

function App() {
  return (
    <Router>
      <Navbar />
      <Switch>
        <Route path='/' />
      </Switch>
      <Map location={location} zoomLevel={16} />
    </Router>
  );
}

export default App;
