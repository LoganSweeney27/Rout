import React from 'react';
import { Link } from 'react-router-dom';

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
          <div className='footer-logo'>
            <Link to='/' className='social-logo'>
                {/* no text */}
                <img src={mainLogo.default}  alt='fireSpot'/>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Footer