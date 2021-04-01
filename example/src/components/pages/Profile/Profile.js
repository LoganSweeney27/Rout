import React from 'react'
import { Button } from '../../Button'
import UserStore from '../Login/Stores/UserStore';

import './Profile.css'

class Profile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            newNickname: UserStore.nickname,
            newState: "",
            newNewState: "",
        };
    }

    handleChangeNickname = (e) => {
        // e.preventDefault();
        // ^ is about stopping or not stopping refreshes, this is the function for the change nickname functino, i.e., either a function that calls a fucntion to make the db call or just the db call.
        // If you want this to just be the db call, just change it to "async...." however you want your db functions to work
    }

    handleSomethingElse = (e) => {
        //Other db call or function for other buttons
    }

    handleLogOut = (e) => {
        //A working log out button here would really help testing
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
                    <input className='profile-input-field' name='newButton' value={this.state.newState} onChange={(e) => this.setState({ newState: e.target.value })} type='text' placeholder='Change this to change placeholder text!' />
                    <Button buttonStyle='btn--regular' onClick={ (e) => this.handleSomethingElse(e) }>
                        Insert Button Here
                    </Button>
                </div>
                <div className='profile-content'>
                    <input className='profile-input-field' name='newNewButton' value={this.state.newNewState} onChange={(e) => this.setState({ newNewState: e.target.value })} type='text' placeholder='Change this to change placeholder text!' />
                    <Button buttonStyle='btn--regular' onClick={ (e) => this.handleSomethingElse(e) }>
                        Maybe Another Button Here
                    </Button>
                </div>
                <div className='profile-content'>
                    <Button buttonStyle='btn--regular' onClick={ (e) => this.handleLogOut(e) }>
                        Logout
                    </Button>
                </div>
            </div>
        )
    }
}

export default Profile
