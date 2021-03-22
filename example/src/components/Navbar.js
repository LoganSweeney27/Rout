import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FaBars, FaTimes } from 'react-icons/fa'
import { Button } from './Button'
import Weather from './Weather'
import DarkMode from './DarkMode'

import './Navbar.css'

var mainLogo = require('./assests/rout_logo_dark_small.png');

function Navbar() {
    const [click, setClick] = useState(false)
    const [button, setButton] = useState(true)
    const [showDetails, setShowDetails] = useState(false)

    const handleClick = () => setClick(!click)
    const closeMobileMenu = () => setClick(false)

    const showButton = () => {
        if(window.innerWidth <= 960) {
            setButton(false)
        } else {
            setButton(true)
        }
    }

    useEffect(() => {
        showButton()
    }, [])

    window.addEventListener('resize', showButton)

    return (
        <>
            <div className='navbar'>
                <div className='navbar-container'>
                    <Link to='/' className='navbar-logo' onClick={closeMobileMenu}>
                        {/* no text */}
                        <img src={mainLogo.default}  alt='Rout Logo'/>
                    </Link>
                    {/* Handles the menu links with resizing */}
                    <div className='menu-icon' onClick={handleClick}>
                        {click ? <FaTimes /> : <FaBars />}
                    </div>
                    <ul className={click ? 'nav-menu active' : 'nav-menu'}>
                        {showDetails && <Weather />}
                        <li className='nav-weather-btn'>
                            <Button buttonStyle='btn--weather' onClick={() => setShowDetails(!showDetails)}>
                                Weather
                            </Button>
                        </li>
                        <li className='nav-item'>
                            <Link to='/Statistics' className='nav-links' onClick={closeMobileMenu}>
                                Statistics
                            </Link>
                        </li>
                        <li className='nav-item'>
                            <Link to='/Login' className='nav-links' onClick={closeMobileMenu}>
                                Login
                            </Link>
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
        </>
    )
}

export default Navbar