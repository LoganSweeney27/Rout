import React from 'react'
import { Button } from '../../Button'
import { Link } from 'react-router-dom'
// import LinkButton from '../../LinkButton';
import UserStore from '../Login/Stores/UserStore';

import './Profile.css'

class Profile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            newNickname: UserStore.nickname,
            profilePicture: UserStore.profilePicture,
        };
    }

    async changeNickname() {
        let username = UserStore.username;
        try {
          let res = await fetch('/changeNickname', {
            method: 'post',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              username: username,
              nickname: this.state.newNickname
            })
          });
          let result = await res.json();
          if (result && result.success) {
            alert("Nickname successfully Updated");
            UserStore.nickname = result.nickname;
          } else if (result && result.success === false) {
            alert(result.msg);
          }
        } catch (e) {
          console.log(e);
        }
    }

    async changeProfilePicture() {
        let username = UserStore.username;
        alert("username:" + username + " and profile pic is:" + this.state.profilePicture)
        try {
            let res = await fetch('/changeProfilePicture', {
                method: 'post',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    profilePicture: this.state.profilePicture
                })
            });
            let result = await res.json();
            if (result && result.success) {
                alert("Profile picture successfully Updated");
                UserStore.profilePicture = result.profilePicture;
            } else if (result && result.success === false) {
                alert(result.msg);
            }
        } catch (e) {
            console.log(e);
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

    handleChangeNickname = (e) => {
        this.changeNickname()
    }

    handleChangeProfilePicture = (e) => {
        this.changeProfilePicture()
    }

    handleLogOut = (e) => {
        this.doLogout()
    }
    
    render() {
        return (
            <div className='profile-container'>
                <h1 className='profile-header'>
                    Profile Page
                </h1>
                <h1 className='profile-subheader'>
                    Hello {this.state.newNickname}!
                </h1>
                <div className='profile-content'>
                    {/* "input" is the input field and the arguments are easy, change name to represent what its inputing for, value is what its changing in the state, onChange is changing the state function, type='text' is for text (probably everything) and placeholder is self explanatory */}
                    <input className='profile-input-field' name='nickname' value={this.state.newNickname} onChange={(e) => this.setState({ newNickname: e.target.value })} type='text' placeholder={this.state.newNickname} />
                    {/* buttons are easy too, just change the function in the onClick function to whatever function you want, and the White text on the inside is the text in the button */}
                    <Button buttonStyle='btn--regular' onClick={ (e) => this.handleChangeNickname(e) }>
                        Change Nickname
                    </Button>
                </div>
                <div className='profile-content'>
                    <input className='profile-input-field' name='newButton' value={this.state.profilePicture} onChange={(e) => this.setState({ profilePicture: e.target.value })} type='text' placeholder={this.state.profilePicture} />
                    <Button buttonStyle='btn--regular' onClick={ (e) => this.handleChangeProfilePicture(e) }>
                        Change Profile Picture
                    </Button>
                    {/* <img src={this.state.profilePicture}  alt='ProfilePic'/> */}
                </div>
                <div className='profile-content' style={{ margin: "15px 3px" }}>
                    <Link className="profile-btn-logout" to="/" onClick={(e) => this.handleLogOut(e)}>Logout</Link>
                </div>
            </div>
        )
    }
}

export default Profile
