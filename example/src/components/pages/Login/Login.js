import React from 'react';
import { observer } from 'mobx-react';
import UserStore from './Stores/UserStore';
import LoginForm from './LoginForm';
import SubmitButton from './SubmitButton';
import { Redirect } from 'react-router-dom';

import './Login.css';

class Login extends React.Component {

  
  onRegister = () => {
    return <Redirect to="/Register/" />
  }

  async componentDidMount() {
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
        UserStore.isDev = result.dev;
        UserStore.email = result.email;
        UserStore.phone = result.phone;
        UserStore.fa = result.fa;
      } else {
        UserStore.loading = false;
        UserStore.isLoggedIn = false;
      }
    }

    catch(e) {
      UserStore.loading = false;
      UserStore.isLoggedIn = false;
    }
  }

  async doLogout() {
    try {
      let res = await fetch('/logout', {
        method: 'post',
        headers: {
          'Accept': 'application/json',
          'Content-type': 'application/json'
        }
      });
      let result = await res.json();
      if (result && result.success) {
        UserStore.isLoggedIn = false;
        UserStore.username = '';
      }
    }

    catch(e) {
      console.log(e)
    }
  }

  render() {
    if (UserStore.loading) {
      return (
        <div className="login-page">
          <div className="login-container">
            Rout is currently loading, please wait.
          </div>
        </div>
      );
    } else {
      if (UserStore.isLoggedIn) {
        return (
          <div className="login-page">
            <div className="login-container">
              Welcome {UserStore.username}

              <SubmitButton
                text={'Log Out'}
                disabled={false}
                onClick= { () => this.doLogout() }
              />
            </div>
          </div>
        );
      }
      if (!UserStore.register) {
        return (
          <div className="login-page">
            <div className="login-container">
              <LoginForm />
            </div>
          </div>
        );
      }
    }
  }
}

export default observer(Login);
