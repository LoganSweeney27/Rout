import React from 'react';

import './Login.css'

class SubmitButton extends React.Component {
  render() {
    return (
      <div className="login-submitButton">
          <button
            className='login-btn'
            disabled={this.props.disabled}
            onClick={ () => this.props.onClick()}
          >
            {this.props.text}
          </button>

      </div>
  );
  }
}

export default SubmitButton;