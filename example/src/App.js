import React from 'react';
import Navbar from './components/Navbar';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Footer from './components/pages/Footer/Footer';
import { Home } from './components/pages/Home/Home';
import Statistics from './components/pages/Statistics/Statistics';
import Login from './components/pages/Login/Login';
import Profile from './components/pages/Profile/Profile'

import './App.css';



function App() {
  return (
    <Router>
      <Navbar />
      <Switch>
        <Route path='/' exact component={Home} />
        <Route path='/Statistics' component={Statistics} />
        <Route path='/Login' component={Login} />
        <Route path='/Profile' component={Profile} />
      </Switch>
      <Footer />
    </Router>
  );
}

export default App;
