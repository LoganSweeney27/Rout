import { RepeatOutlined } from '@material-ui/icons';
import React from 'react'
import { Line } from 'react-chartjs-2';
import UserStore from '../Login/Stores/UserStore';

import './LineChart.css'

class LineChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        data: [],
        labels: [],
        maxCalories: '500',
        loading: true,
        username: UserStore.username,
    };
    this.fetchLinePastRoutes();
  }

  async fetchLinePastRoutes() {
    try {
      let res = await fetch('/getLine', {
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
            // If successful we should set user calories and dates to all rows found
            this.setState({ data: result.data, labels: result.labels, maxCalories: result.maxCalories })
        } else {
            alert("Could not find previous routes with calories burned.");
            this.setState({ data: [], labels: [] })
        }
    } catch(e) {
        console.log(e)
    }
    this.setState({ loading: false })
  }

  render() {
    let maxCals = this.state.maxCalories;
    const data = {
      labels: this.state.labels,
      datasets: [
        {
          label: "Calories",
          data: this.state.data,
          pointBackgroundColor: 'rgba(100, 150, 250, 1)',
          backgroundColor: 'rgba(100, 150, 250, 0.5)',
          borderColor: 'rgba(100, 150, 250, 1)',
        },
      ]
    };
  
    const options = {
      responsive: true,
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Calories Burned Over Time",
        fontSize: 20,
        fontColor: 'rgba(100, 150, 250, 1)',
      },
      scales: {
        xAxes: [{
          ticks: {
            fontColor: 'rgba(80, 130, 250, 1)',
          },
          gridLines: {
            display: false,
            drawBorder: false
          }
        }],
        yAxes: [{
            ticks: {
              fontColor: 'rgba(80, 130, 250, 1)',
              suggestedMin: 0,
              suggestedMax: maxCals,
            },
            gridLines: {
              display: false,
              drawBorder: false
            }
          }]
      }
    };
    if (this.state.loading) {
        return <div className='loading'>Data is loading... </div>;
    } else if (this.state.data.length < 2) {
        return <div className='loading'>Not enough routes to display line graph. </div>;
    } else {
      return (
        <div className='lineChart'>
          <Line data={data} options={options}/>
        </div>
      )
    }
  }
}

export default LineChart