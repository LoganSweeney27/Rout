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
      profilePicture: 'https://t4.ftcdn.net/jpg/04/10/43/77/360_F_410437733_hdq4Q3QOH9uwh0mcqAhRFzOKfrCR24Ta.jpg',
      forgotCode: '',
      buttonDisabled: false,
      formDisabled: false,
      forgotDisable: false,
      forgot: false,
      email: '',
      enableFA: false,
      changeFA: "Enable Two Factor Authentication",
      phone: ''
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
      email: '',
      forgot: false,
      formDisabled: false,
      forgotCode: '',
      enableFA: false

    })
  }

  async enableFA() {
    this.setState({
      username: this.state.username,
          password: this.state.password,
          profilePicture: this.state.profilePicture,
          email: this.state.email,
          nickname: this.state.nickname,
          enableFA: !this.state.enableFA,
          changeFA: "Disable Two Factor Authentication"
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

  async switchForgot() {
    this.setState ({
      username: '',
      password: '',
      formDisabled: true,
      forgot: true
    })
  }
  async doRegister() {
    console.log("hello");
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
          nickname: this.state.nickname,
          enableFA: this.state.enableFA,
          phone: this.state.phone
        })
      });
      let result = await res.json();
      if (result && result.success) {
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
          password: this.state.password,
          forgotCode: 'Unset'
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
          password: this.state.password,
          forgotCode: this.state.forgotCode,
        })
      });
      let result = await res.json();
      if (result && result.success) {
        UserStore.isLoggedIn = true;
        UserStore.username = result.username;
        UserStore.profilePicture = result.profilePicture;
        UserStore.isDev = result.dev;
        UserStore.email = result.email;
        UserStore.phone = result.phone;
        UserStore.fa = result.fa;
      } else if (result && result.success === false) {
        this.resetForm();
        alert(result.msg);
      }
    } catch (e) {
      console.log(e);
      this.resetForm();
    }
  }


  async sendCodeFA() {
    console.log("hi");
    try {
      let res = await fetch ('/sendCodeFA', {
        method: 'post',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: this.state.username
        })
      });
      let result = await res.json();
    } catch (e) {
      console.log(e);
      this.resetForm();
    }
  }
  /* if user forgot password, run this */
  async sendCode() {
    try {
      let res = await fetch ('/sendCode', {
        method: 'post',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: this.state.username,
          password: this.state.password,
          email: this.state.email,
          phone: this.state.phone
        })
      });
      let result = await res.json();
    } catch (e) {
      console.log(e);
      this.resetForm();
    }
  }

  async submitCode() {
    console.log("submit");
    try {
      let res = await fetch ('/submitCode', {
        method: 'post',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password: this.state.password,
          email: this.state.email,
          forgotCode: this.state.forgotCode,
          phone: this.state.phone
        })
      });
      let result = await res.json();
      this.resetForm();
      alert(result.msg);
    } catch (e) {
      console.log(e);
      this.resetForm();
    }
  }

  render() {
    return (
      <div>
      { (!this.state.formDisabled && !this.state.forgot) && (
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
                text='Send Two Factor Code (if enabled)'
                disabled={this.state.buttonDisabled}
                onClick={ () => this.sendCodeFA()}
              />
            <InputField
              type='text'
              placeholder='Two Factor Code (leave blank if none)'
              value={this.state.forgotCode ? this.state.forgotCode : ''}
              onChange={ (val) => this.setInputValue('forgotCode', val)}
              />

              <SubmitButton
                text='Login'
                disabled={this.state.buttonDisabled}
                onClick={ () => this.doLogin()}
              />

              <SubmitButton
                text='Forgot Password?'
                disabled={this.state.buttonDisabled}
                onClick={ () => this.switchForgot()}
              />

              <SubmitButton
                text='New to Rout? Click here to register'
                disabled={this.state.buttonDisabled}
                onClick= { () => this.switchRegister()}
              />
        </div>
        )}
        { (this.state.formDisabled && !this.state.forgot) && (
          // No register From CSS styling
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

              <InputField
              type='text'
              placeholder='Phone Number (no spaces)'
              value={this.state.phone ? this.state.phone : ''}
              onChange={ (val) => this.setInputValue('phone', val)}
              />
              <SubmitButton
              text = {this.state.changeFA}
              onClick= { () => this.enableFA()}
              />

              <SubmitButton
                text='Register'
                disabled={this.state.buttonDisabled}
                onClick= { () => this.doRegister()}
              />
              
          </div>


        )}

        { this.state.forgot && (
          // No register From CSS styling
          <div className="registerForm">
            Forgot Password? We'll send a code to your email and/or phone.

            <InputField
              type='text'
              placeholder='Email'
              value={this.state.email ? this.state.email : ''}
              onChange={ (val) => this.setInputValue('email', val)}
            />

            <InputField
              type='text'
              placeholder='Phone Number (no space)'
              value={this.state.phone ? this.state.phone : ''}
              onChange={ (val) => this.setInputValue('phone', val)}
            />

            <InputField
              type='text'
              placeholder='Enter Code Here'
              disabled={!this.state.forgotDisable}
              value={this.state.forgotCode ? this.state.forgotCode : ''}
              onChange={ (val) => this.setInputValue('forgotCode', val)}
            />

              <InputField
              type='password'
              placeholder='New Password'
              value={this.state.password ? this.state.password : ''}
              onChange={ (val) => this.setInputValue('password', val)}
              />

            <SubmitButton
                text='Send Code'
                disabled={this.state.forgotDisable}
                onClick= { () => this.sendCode()}
              />
            <SubmitButton
                text='Submit Code and Change Password'
                disabled={this.state.forgotDisable}
                onClick= { () => this.submitCode()}
            />

            


              
          </div>


        )}

        </div>
    );
  
  }
}

export default LoginForm;