import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FaBars, FaTimes, FaLightbulb, FaRegLightbulb } from 'react-icons/fa'
import { Button } from './Button'
import './Navbar.css'

var mainLogo = require('./assests/rout_logo_dark_small.png');

function Navbar() {
    const [click, setClick] = useState(false)
    const [button, setButton] = useState(true)

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
                        <img src={mainLogo.default}  alt='fireSpot'/>
                    </Link>
                    {/* Handles the menu links with resizing */}
                    <div className='menu-icon' onClick={handleClick}>
                        {click ? <FaTimes /> : <FaBars />}
                    </div>
                    <ul className={click ? 'nav-menu active' : 'nav-menu'}>
                        <li className='nav-item'>
                            <Link to='/Statistics' className='nav-links' onClick={closeMobileMenu}>
                                User Statistics
                            </Link>
                        </li>
                        <li className='nav-btn'>
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
                        </li>
                        <li className='nav-btn' onClick={handleClick}>
                            <Button buttonStyle='btn--lightbulb'>
                                {click ? <FaRegLightbulb /> : <FaLightbulb />}
                            </Button>
                        </li>
                    </ul>
                </div>
            </div>
        </>
    )
}

export default Navbar