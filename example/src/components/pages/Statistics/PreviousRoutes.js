import React from 'react'
import UserStore from '../Login/Stores/UserStore';

import './PreviousRoutes.css'

const columnHeader =["Distance (Meters)", "Time (Seconds)", "Calories Burned", "Date"];

class PreviousRoutes extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            distances: [],
            times: [],
            calories: [],
            dates: [],
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
                // If successful we should set distance, time, calories, and dates to all rows found
                this.setState({ distances: result.distances, times: result.times, calories: result.calories, dates: result.dates })
            } else {
                alert("Could not find prevoius routes to display.");
                this.setState({ distances: 'N/A', times:'N/A', calories: 'N/A', dates: 'N/A' })
            }
        } catch(e) {
            console.log(e)
        }
        this.setState({ loading: false })
    }

    generateHeader(){
        let res=[];
        for(var i =0; i < columnHeader.length; i++){
            res.push(<th key={columnHeader[i]}>{columnHeader[i]}</th>)
        }
        return res;
    }

    generateTableData(){
        let res=[];
        for(var i =0; i < this.state.distances.length; i++){
            res.push(
            <tr >
            <td key={this.state.distances[i]}>{this.state.distances[i]}</td>
            <td key={this.state.times[i]}>{this.state.times[i]}</td>
            <td key= {this.state.calories[i]}>{this.state.calories[i]}</td>
            <td key={this.state.dates[i]}>{this.state.dates[i]}</td>
            </tr>
            )
        }
        return res;
    }
    render(){
        if (this.state.loading) {
            return <div className='loading'>Data is loading... </div>;
        } else {
            return(
            <div className='table'>
                <table className="data">
                <thead>
                    <tr>
                    {this.generateHeader()}
                    </tr>
                </thead>
                <tbody>
                    {this.generateTableData()}
                </tbody>
                </table>
            </div>
            )
        }
    }
}

export default PreviousRoutes
