import React from 'react'
import { Button } from '../../Button'
import UserStore from '../Login/Stores/UserStore';

import './Comparison.css'

class Comparison extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            runner: 'Wayde Van Niekerk',
            runnerDistance: '400',
            runnerTime: '43.03',
            userDistance: '',
            userTime: '',
            username: UserStore.username,
        };
    }

    async fetchRoute() {
        try {
          let res = await fetch('/getCompare', {
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                dist: this.state.runnerDistance,
                username: this.state.username
              })
          });
          let result = await res.json();
            if (result && result.success) {
                // If successful we should set user distance and time to route fetched
                this.setState({ userDistance: result.dist, userTime: result.time })
            } else {
                alert("Could not find prevoius route with distance close enough. Try another runner!");
                this.setState({ userDistance: 'N/A', userTime: 'N/A' })
            }
        } catch(e) {
            console.log(e)
        }
    }

    runners = [['Wayde Van Niekerk', '400', '43.03'], ['David Rudisha', '800', '1:40.91'], ['Hicham El Guerrouj', '1500', '3:26.00'], ['Daniel Komen', '3000', '7:20.67'], ['Joshua Cheptegei', '5000', '12:35.36']]

    handleFetch = (e) => {
        e.preventDefault();
        this.fetchRoute();
    }

    handleChange = (e) => {
        this.setState({ userDistance: '', userTime: '' })
        this.setState({ runner: e.target.value})
        for (var i = 0; i < this.runners.length; i++) {
            if (this.runners[i][0] === e.target.value) {
                this.setState({ runnerDistance: this.runners[i][1], runnerTime: this.runners[i][2] })
            }
        }
    }

    minutesSeconds() {
        if (this.state.userTime === '' || this.state.userTime === 'N/A') {
            return this.state.userTime;
        } else {
            var minutes = Math.floor(parseFloat(this.state.userTime) / 60);
            var seconds = parseFloat(this.state.userTime) - minutes * 60;
            seconds = (seconds).toFixed(2);
            if (minutes === 0) {
                return seconds;
            }
            alert(seconds[0])
            if (seconds[0] == 0) {
                return minutes + ":0" + seconds;
            } else {
                return minutes + ":" + seconds;
            }
        }
    }

    render () {
        return (
            <div className='table-input-container'>
                <h1 className='title'>You V.S. World Records</h1>
                <form className='input-form'>
                    <label>
                        Compare youself to:
                        <select value={this.state.value} onChange={this.handleChange}>
                            <option value={this.runners[0][0]}>{this.runners[0][0]}</option>
                            <option value={this.runners[1][0]}>{this.runners[1][0]}</option>
                            <option value={this.runners[2][0]}>{this.runners[2][0]}</option>
                            <option value={this.runners[3][0]}>{this.runners[3][0]}</option>
                            <option value={this.runners[4][0]}>{this.runners[4][0]}</option>
                        </select>
                    </label>
                    <Button buttonStyle='btn--regular' onClick={ (e) => this.handleFetch(e) }>Enter</Button>
                </form>
                <table className='data'>
                    <thead>
                        <tr>
                        <th></th>
                        <th>You</th>
                        <th>{this.state.runner}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                        <td>Distance (Meters)</td>
                        <td>{this.state.userDistance}</td>
                        <td>{this.state.runnerDistance}</td>
                        </tr>
                        <tr>
                        <td>Time (Seconds)</td>
                        <td>{this.minutesSeconds()}</td>
                        <td>{this.state.runnerTime}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        )
    }
}

export default Comparison
