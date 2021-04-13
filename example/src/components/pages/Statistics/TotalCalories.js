import React from 'react'
import UserStore from '../Login/Stores/UserStore';

import './TotalCalories.css'


class TotalCalories extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            calories: 'N/A',
            loading: true,
            username: UserStore.username,
        };
        this.fetchPrevRoutes();
    }

    async fetchPrevRoutes() {
        try {
          let res = await fetch('/getPrevRoutes', {
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                username: this.state.username
              })
          });
          let result = await res.json();
            if (result && result.success) {
                // If successful we should set calories to the total of all routes
                let totalCalories = result.calories.reduce((caloriesCount, value) => caloriesCount + value);
                this.setState({ calories: totalCalories })
            } else {
                alert("Could not find prevoius routes to display.");
                this.setState({ calories: 'N/A' })
            }
        } catch(e) {
            console.log(e)
        }
        this.setState({ loading: false })
    }

    render(){
        if (this.state.loading) {
            return <div className='loading'>Data is loading... </div>;
        } else {
            return(
            <div className=''>
                <h1 className='header'>Total Calories Burned: {this.state.calories}</h1>
            </div>
            )
        }
    }
}

export default TotalCalories
