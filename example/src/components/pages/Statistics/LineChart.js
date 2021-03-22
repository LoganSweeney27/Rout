import React from 'react'
import { Line } from 'react-chartjs-2';

import './LineChart.css'

const LineChart = () => {
  const data = {
    labels: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    datasets: [
      {
        label: "Calories",
        data: [1000, 1200, 800, 1800, 1400, 1300, 900],
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
      text: "Calores Burned By Day",
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
            suggestedMax: 2000
          },
          gridLines: {
            display: false,
            drawBorder: false
          }
        }]
    }
  };

  return (
    // style={{ width: '500px', height: '400px' }}
    <div className='lineChart'>
        <Line data={data} options={options}/>
    </div>
  );
}

export default LineChart