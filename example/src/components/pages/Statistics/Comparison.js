import React from 'react'

import './Comparison.css'

class Comparison extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            isLoaded: false,
            runner: 'Wayde Van Niekerk',
            distance: '400 Meters',
            time: '43.03',
        };
    }

    // async fetchRoute() {
    //     try {
    //       let res = await fetch('/getRoute', {
    //         method: 'post',
    //         headers: {
    //             'Accept': 'application/json',
    //             'Content-type': 'application/json'
    //         }
    //       });
    //       let result = await res.json();
    //         if (result && result.success) {
    //             UserStore.isLoggedIn = false;
    //             UserStore.username = '';
    //         }
    //     }
    
    //     catch(e) {
    //         console.log(e)
    //     }
    // }

    runners = [['Wayde Van Niekerk', '400 Meters', '43.03'], ['David Rudisha', '800 Meters', '1:40.91'], ['Hicham El Guerrouj', '1500 Meters', '3:26.00'], ['Daniel Komen', '3000 Meters', '7:20.67'], ['Joshua Cheptegei', '5000 Meters', '12:35.36']]

    // May not need sumbit button, could possible handle SQL query onChange instead of onSubmit
    handleSubmit = (e) => {
        alert("Submitted: " + this.state.runner)
    }

    handleChange = (e) => {
        this.setState({ runner: e.target.value})
        for (var i = 0; i < this.runners.length; i++) {
            if (this.runners[i][0] === e.target.value) {
                this.setState({ distance: this.runners[i][1], time: this.runners[i][2] })
            }
        }
    }

    render () {
        const { data } = this.state;
        // !this.isLoaded
        if (this.isLoaded) {
            return <div>Data is loading... </div>;
        } else {
            return (
                <div>
                    <h1 className='title'>You V.S. World Records</h1>
                    <form className='input-form' onSubmit={this.handleSubmit}>
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
                        <input className='input-submit' type='submit' value='Enter' />
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
                            <td>Distance</td>
                            <td>N/A</td>
                            <td>{this.state.distance}</td>
                            </tr>
                            <tr>
                            <td>Time</td>
                            <td>N/A</td>
                            <td>{this.state.time}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )
        }
    }
}

export default Comparison
