import React, { useState, useEffect, Component } from 'react'
import { Link } from 'react-router-dom'
import { FaBars, FaTimes } from 'react-icons/fa'
import { Button } from './Button'
import Weather from './Weather'
import DarkMode from './DarkMode'
import UserStore from './pages/Login/Stores/UserStore'

import './Navbar.css'

var mainLogo = require('./assests/rout_logo_dark_small.png');

class Navbar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            click: false,
            button: true,
            showWeather: false,
        };
        window.addEventListener('resize', this.showButton)
    }

    componentDidMount() {
        this.isLoggedIn()
        this.navbar.addEventListener('click', this.reRender);
    }

    componentWillUnmount() {
        this.navbar.removeEventListener('click', this.reRender);
    }

    async isLoggedIn() {
        // alert("checking if logged in: UserStore.username=" + UserStore.username + " and UserStore.isLoggedIn=" + UserStore.isLoggedIn)
        try {
            let res = await fetch('/isLoggedIn', {
              method: 'post',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              }
            });
            let result = await res.json();
            if (result && result.success) {
              UserStore.loading = false;
              UserStore.isLoggedIn = true;
              UserStore.username = result.username;
              UserStore.profilePicture = result.profilePicture;
              UserStore.nickname = result.nickname;
      
            } else {
              UserStore.loading = false;
              UserStore.isLoggedIn = false;
            }
          }
      
          catch(e) {
            UserStore.loading = false;
            UserStore.isLoggedIn = false;
          }
        // alert("After Check: UserStore.username=" + UserStore.username + " and UserStore.isLoggedIn=" + UserStore.isLoggedIn)
        this.setState({})
    }

    reRender = (e) => {
        this.isLoggedIn()
        this.forceUpdate()
    }

    setShowWeather = (e) => {
        this.setState({ showWeather: !(this.state.showWeather) })
    }

    handleClick = (e) => {
        this.setState({ click: !(this.state.click) })
    }

    closeMobileMenu = (e) => {
        this.setState({ click: false })
    }

    showButton = (e) => {
        if(window.innerWidth <= 960) {
            this.setState({ button: false })
        } else {
            this.setState({ button: true })
        }
    }

    render() {
        return (
            <div ref={elem => this.navbar = elem} className='navbar'>
                <div className='navbar-container'>
                    <Link to='/' className='navbar-logo' onClick={ (e) => this.closeMobileMenu(e) }>
                        {/* no text */}
                        <img src={mainLogo.default}  alt='Rout Logo'/>
                    </Link>
                    {/* Handles the menu links with resizing */}
                    <div className='menu-icon' onClick={ (e) => this.handleClick(e) }>
                        {this.state.click ? <FaTimes /> : <FaBars />}
                    </div>
                    <ul className={this.state.click ? 'nav-menu active' : 'nav-menu'}>
                        {this.state.showWeather && <Weather />}
                        <li className='nav-weather-btn'>
                            <Button buttonStyle='btn--weather' onClick={ (e) => this.setShowWeather(e) }>
                                Weather
                            </Button>
                        </li>
                        <li className='nav-item'>
                            {UserStore.isLoggedIn && <Link to='/Statistics' className='nav-links' onClick={ (e) => this.closeMobileMenu(e) }>Statistics</Link>}
                        </li>
                        {/* <li className='nav-item'>
                            {this.state.loggedIn ? <Link to='/Profile' className='nav-links' onClick={ (e) => this.closeMobileMenu(e) }>Profile</Link> : <Link to='/Login' className='nav-links' onClick={ (e) => this.closeMobileMenu(e) }>Login</Link>}
                        </li> */}
                        <li className='nav-item'>
                            {UserStore.isLoggedIn && <Link to='/Profile' className='nav-links' onClick={ (e) => this.closeMobileMenu(e) }>Profile</Link>}
                        </li>
                        <li className='nav-item'>
                            <Link to='/Login' className='nav-links' onClick={ (e) => this.closeMobileMenu(e) }>Login</Link>
                        </li>
                        {/* example of using mobile buttons */}
                        {/* <li className='nav-btn'>
                            {button ? (
                                <Link to='/Login' className='btn-link'>
                                    <Button buttonStyle='btn--outline'>
                                        Login
                                    </Button>
                                </Link>
                            ): (
                                //Button for mobile
                                <Link to='/Login' className='btn-link' onClick={closeMobileMenu}>
                                    <Button buttonStyle='btn--outline' buttonSize='btn--mobile'>
                                        Login
                                    </Button>
                                </Link>
                            )}
                        </li> */}

                        <DarkMode />
                    </ul>
                </div>
            </div>
        )
    }
}

export default Navbar