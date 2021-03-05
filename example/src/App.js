import React from 'react';
import Map from './components/Map' // import the map here
import './App.css';
import Navbar from './components/Navbar';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Footer from './components/pages/Footer/Footer';
import { Home } from './components/pages/Home/Home';
import Statistics from './components/pages/Statistics/Statistics';
import Login from './components/pages/Login/Login';

function App() {
  return (
    <Router>
      <Navbar />
      <Switch>
        <Route path='/' exact component={Home} />
        <Route path='/Statistics' component={Statistics} />
        <Route path='/Login' component={Login} />
      </Switch>
      <Footer />
    </Router>
  );
}

export default App;
