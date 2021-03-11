import React from 'react';
import InputField from './InputField';
import SubmitButton from './SubmitButton';
import UserStore from './Stores/UserStore';

import './Login.css'

class LoginForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      nickname: '',
      profilePicture: '',
      buttonDisabled: false,
      formDisabled: false,
      email: ''
    }
  }

  setInputValue(property, val) {
    val = val.trim();
    if (val.length > 32) {
      return;
    }
    this.setState({
      [property]: val
    })
  }

  hideForm() {
    this.setState({
      formDisabled: false
    })
  }
  resetForm() {
    this.setState({
      username: '',
      password: '',
      buttonDisabled: false,
      nickname: '',
      profilePicture: '',
      email: ''
    })
  }

  async switchRegister() {
    this.setState ({
      username: '',
      password: '',
      buttonDisabled: false,
      formDisabled: true
    })
  }

  async doRegister() {
    try {
      let res = await fetch('/Register', {
        method: 'post',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: this.state.username,
          password: this.state.password,
          profilePicture: this.state.profilePicture,
          email: this.state.email,
          nickname: this.state.nickname
        })
      });
      let result = await res.json();
      if (result && result.success) {
        UserStore.isLoggedIn = true;
        UserStore.username = result.username;
        UserStore.nickname = result.nickname;
      } else if (result && result.success === false) {
        console.log("error")
        this.resetForm();
        alert(result.msg);
      }
    } catch (e) {
      console.log(e);
      this.resetForm();
    }

    this.setState({
      buttonDisabled: true,
      formDisabled: false
    })
    try {
      let res = await fetch('/login', {
        method: 'post',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: this.state.username,
          password: this.state.password
        })
      });
      let result = await res.json();
      if (result && result.success) {
        UserStore.isLoggedIn = true;
        UserStore.username = result.username;
      } else if (result && result.success === false) {
        this.resetForm();
        alert(result.msg);
      }
    } catch (e) {
      console.log(e);
      this.resetForm();
    }
  }
  async doLogin() {
    if (!this.state.username) {
      return;
    }
    if (!this.state.password) {
      return;
    }
    this.setState({
      buttonDisabled: true
    })
    try {
      let res = await fetch('/login', {
        method: 'post',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: this.state.username,
          password: this.state.password
        })
      });
      let result = await res.json();
      if (result && result.success) {
        UserStore.isLoggedIn = true;
        UserStore.username = result.username;
      } else if (result && result.success === false) {
        this.resetForm();
        alert(result.msg);
      }
    } catch (e) {
      console.log(e);
      this.resetForm();
    }
  }
  render() {
    return (
      <div>
      { !this.state.formDisabled && (
        <div className="loginForm">
            Login
            <InputField
              type='text'
              placeholder='Username'
              value={this.state.username ? this.state.username : ''}
              onChange={ (val) => this.setInputValue('username', val)}
              />

            <InputField
              type='password'
              placeholder='Password'
              value={this.state.password ? this.state.password : ''}
              onChange={ (val) => this.setInputValue('password', val)}
              />

              <SubmitButton
                text='Login'
                disabled={this.state.buttonDisabled}
                onClick={ () => this.doLogin()}
              />

              <SubmitButton
                text='Forgot Password?'
                disabled={this.state.buttonDisabled}
                onClick={ () => this.switchRegister()}
              />

              <SubmitButton
                text='New to Rout? Click here to register'
                disabled={this.state.buttonDisabled}
                onClick= { () => this.switchRegister()}
              />
        </div>
        )}
        { this.state.formDisabled && (
          // No registerFrom CSS styling
          <div className="registerForm">
            Register Below! 

            <InputField
              type='text'
              placeholder='Email'
              value={this.state.email ? this.state.email : ''}
              onChange={ (val) => this.setInputValue('email', val)}
            />

            <InputField
              type='text'
              placeholder='Username'
              value={this.state.username ? this.state.username : ''}
              onChange={ (val) => this.setInputValue('username', val)}
              />

            <InputField
              type='password'
              placeholder='Password'
              value={this.state.password ? this.state.password : ''}
              onChange={ (val) => this.setInputValue('password', val)}
              />

            <InputField
              type='text'
              placeholder='Nickname'
              value={this.state.nickname ? this.state.nickname : ''}
              onChange={ (val) => this.setInputValue('nickname', val)}
              />

            <InputField
              type='text'
              placeholder='Profile Picture URL'
              value={this.state.profilePicture ? this.state.profilePicture : ''}
              onChange={ (val) => this.setInputValue('profilePicture', val)}
              />

              <SubmitButton
                text='Register'
                disabled={this.state.buttonDisabled}
                onClick= { () => this.doRegister()}
              />
              
          </div>


        )}

        </div>
    );
  
  }
}

export default LoginForm;