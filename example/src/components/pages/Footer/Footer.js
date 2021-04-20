import React from 'react';
import { Link } from 'react-router-dom';
// import { FaFacebook, FaInstagram, FaYoutube, FaTwitter } from 'react-icons/fa';

import './Footer.css';

var mainLogo = require('../../assests/rout_logo_dark_small.png');

function Footer() {
  return (
    <div className='footer-container'>
      <section>
        <small className='website-rights'>Rout © 2021</small>
      </section>
      <section className='social-media'>
        <div className='social-media-wrap'>
          {/* <div className='social-icons'>
            <Link
              className='social-icon-link'
              to='/'
              target='_blank'
              aria-label='Facebook'
            >
              <FaFacebook />
            </Link>
            <Link
              className='social-icon-link'
              to='/'
              target='_blank'
              aria-label='Instagram'
            >
              <FaInstagram />
            </Link>
          </div> */}
          <div className='footer-logo'>
            <Link to='/' className='social-logo'>
                {/* no text */}
                <img src={mainLogo.default}  alt='fireSpot'/>
            </Link>
          </div>
          {/* <div className='social-icons'>
            <Link
              className='social-icon-link'
              to='/'
              target='_blank'
              aria-label='Youtube'
            >
              <FaYoutube />
            </Link>
            <Link
              className='social-icon-link'
              to='/'
              target='_blank'
              aria-label='Twitter'
            >
              <FaTwitter />
            </Link>
          </div> */}
        </div>
      </section>
    </div>
  )
}

export default Footer