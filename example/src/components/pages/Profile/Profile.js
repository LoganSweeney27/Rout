import React from 'react'
import { Button } from '../../Button'
import { Link } from 'react-router-dom'
import UserStore from '../Login/Stores/UserStore';
import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';

import './Profile.css'

class Profile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            newNickname: UserStore.nickname,
            profilePicture: UserStore.profilePicture,
            email: UserStore.email,
            phone: UserStore.phone,
            FAEnabled: UserStore.fa,
            code: ""
        };
        this.setFAEnabled();
    }

    setFAEnabled = () => {
        this.setState({ FAEnabled: Boolean(UserStore.fa) })
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

    async changeEmail() {
        let username = UserStore.username;
        try {
            let res = await fetch('/changeEmail', {
                method: 'post',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    email: this.state.email
                })
            });
            let result = await res.json();
            if (result && result.success) {
                alert("Email successfully Updated");
                UserStore.email = result.email;
            } else if (result && result.success === false) {
                alert(result.msg);
            }
        } catch (e) {
            console.log(e);
        }
    }

    async changePhone() {
        let username = UserStore.username;
        try {
            let res = await fetch('/changePhone', {
                method: 'post',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    phone: this.state.phone
                })
            });
            let result = await res.json();
            if (result && result.success) {
                alert("Phone successfully Updated");
                UserStore.phone = result.phone;
            } else if (result && result.success === false) {
                alert(result.msg);
            }
        } catch (e) {
            console.log(e);
        }
    }

    async changeTFA() {
        let username = UserStore.username;
        let fa = this.state.FAEnabled ? 0 : 1;
        try {
            let res = await fetch('/changeTFA', {
                method: 'post',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    fa: fa
                })
            });
            let result = await res.json();
            if (result && result.success) {
                alert("TFA successfully Updated");
                UserStore.fa = result.fa;
            } else if (result && result.success === false) {
                alert(result.msg);
            }
        } catch (e) {
            console.log(e);
        }
    }

    async doFB() {
        let code = this.state.code;
        console.log(code);
        if (code != "") {
            try {
                let res = await fetch('/postFB', {
                    method: 'post',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        code: code
                    })
                });
                let result = await res.json();
                if (result && result.success) {
                  alert("Route successfully shared");
                } else if (result && result.success === false) {
                    alert(result.msg);
                }
            } catch (e) {
                console.log(e);
            }
        } else {
            console.log("empty");
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

    handleChangeEmail= (e) => {
        this.changeEmail()
    }

    handleChangePhone = (e) => {
        this.changePhone()
    }

    handleChangeTFA = (e) => {
        this.changeTFA()
        this.setState({ FAEnabled: !this.state.FAEnabled })
    }
    handleLogOut = (e) => {
        this.doLogout()
    }

    createHref = () => {
        let part1 = "https://twitter.com/intent/tweet?hashtags=routlink&original_referer=https%3A%2F%2Fdeveloper.twitter.com%2F&ref_src=twsrc%5Etfw&related=twitterapi%2Ctwitter&text=I%20just%20ran%20an%20awesome%20route!%20Here's%20the%20code: ";
        let part2 = "!&tw_p=tweetbutton&url=https%3A%2F%2Frout.link";
        return part1 + this.state.code + part2;
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
                <div className="profile-content-container">
                    <div className="profile-content-info">
                        <div className='profile-content'>
                            {/* "input" is the input field and the arguments are easy, change name to represent what its inputing for, value is what its changing in the state, onChange is changing the state function, type='text' is for text (probably everything) and placeholder is self explanatory */}
                            <input className='profile-input-field' name='nickname' value={this.state.newNickname} onChange={(e) => this.setState({ newNickname: e.target.value })} type='text' placeholder={this.state.newNickname} />
                            {/* buttons are easy too, just change the function in the onClick function to whatever function you want, and the White text on the inside is the text in the button */}
                            <Button buttonStyle='btn--regular' onClick={ (e) => this.handleChangeNickname(e) }>
                                Change Nickname
                            </Button>
                        </div>
                        <div className='profile-content'>
                            <input className='profile-input-field' name='profile picture' value={this.state.profilePicture} onChange={(e) => this.setState({ profilePicture: e.target.value })} type='text' placeholder={this.state.profilePicture} />
                            <Button buttonStyle='btn--regular' onClick={ (e) => this.handleChangeProfilePicture(e) }>
                                Change Profile Picture
                            </Button>
                        </div>
                        <div className='profile-content'>
                            <input className='profile-input-field' name='email' value={this.state.email} onChange={(e) => this.setState({ email: e.target.value })} type='text' placeholder={this.state.email} />
                            <Button buttonStyle='btn--regular' onClick={ (e) => this.handleChangeEmail(e) }>
                                Change Email Address
                            </Button>
                        </div>
                        <div className='profile-content'>
                            <input className='profile-input-field' name='phone' value={this.state.phone} onChange={(e) => this.setState({ phone: e.target.value })} type='text' placeholder={this.state.phone} />
                            <Button buttonStyle='btn--regular' onClick={ (e) => this.handleChangePhone(e) }>
                                Change Phone Number
                            </Button>
                        </div>
                        <div className='profile-content'>
                            {this.state.FAEnabled ? <Button buttonStyle='btn--logout' onClick={ (e) => this.handleChangeTFA(e) }>Disable TFA</Button> : <Button buttonStyle='btn--logout' onClick={ (e) => this.handleChangeTFA(e) }>Enable TFA</Button>}
                        </div>
                        <div className='profile-content'>
                            <b style={{ marginLeft: "3px" }}>
                                Share your routes:
                            </b>
                            <input className='profile-input-field' name='code' value={this.state.code} onChange={(e) => this.setState({ code: e.target.value })} type='text' placeholder={"Enter Route ID Here"} />
                            <Button buttonStyle='btn--regular'>
                                <a title="send to Facebook" 
                                    href="http://www.facebook.com/sharer.php?s=100&p[title]=MyRout&p[quote]=hello&p[url]=https://rout.link/"
                                    target="_blank"
                                    rel="noreferrer">
                                <FaFacebook /></a>
                            </Button>
                            <Button buttonStyle='btn--regular'>
                                <a title="send to Instagram" 
                                    href="https://www.instagram.com/"
                                    target="_blank"
                                    rel="noreferrer">
                                <FaInstagram /></a>
                            </Button>
                            <Button buttonStyle='btn--regular'>
                                <a class="twitter-share-button"
                                href={this.createHref()}
                                target="_blank"
                                rel="noreferrer"
                                data-size="large">
                                <FaTwitter />Tweet</a>
                            </Button>
                        </div>
                        <div className='profile-content' style={{ margin: "15px 3px" }}>
                            <Link className="profile-btn-logout" to="/" onClick={(e) => this.handleLogOut(e)}>Logout</Link>
                        </div>
                    </div>
                    <div className="profile-picture">
                        <img className="profile-picture-img" src={this.state.profilePicture} alt='ProfilePic'/>
                    </div>
                </div>
            </div>
        )
    }
}

export default Profile
