import React from 'react'
import { Chart } from 'react-charts'

const LineChart = () => {
    const data = React.useMemo(
        () => [
          {
            label: 'Series 1',
            data: [[0, 300], [1, 200], [2, 400], [3, 200], [4, 700]]
        }
        //,
        //   {
        //     label: 'Series 2',
        //     data: [[0, 3], [1, 1], [2, 5], [3, 6], [4, 4]]
        //   }
        ],
        []
      )
     
    const axes = React.useMemo(
        () => [
          { primary: true, type: 'linear', position: 'bottom' },
          { type: 'linear', position: 'left' }
        ],
        []
      )
      
    return (
        <div style={{ width: '500px', height: '400px' }}>
            <Chart data={data} axes={axes} />
        </div>
    )
}

export default LineChart