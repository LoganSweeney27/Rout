import React from 'react';

import './Login.css';

class InputField extends React.Component {
  render() {
    return (
      <div className="login-inputField">
          <input
            className='login-input'
            type={this.props.type}
            placeholder={this.props.placeholder}
            value={this.props.value}
            onChange={ (e) => this.props.onChange(e.target.value)}
            />
      </div>
  );
  }
}

export default InputField;