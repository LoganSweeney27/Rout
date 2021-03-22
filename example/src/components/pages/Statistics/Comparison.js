import React from 'react'

import './Comparison.css'

const Comparison = () => {
    return (
        <div>
            <h1 className='title'>You V.S. World Records</h1>
            <table className='data'>
                <thead>
                    <tr>
                    <th></th>
                    <th>You</th>
                    <th>Wayde Van Niekerk</th>
                    <th>David Rudisha</th>
                    <th>Hicham El Guerrouj</th>
                    <th>Daniel Komen</th>
                    <th>Joshua Cheptegei</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                    <td>Distance</td>
                    <td>N/A</td>
                    <td>400 Meters</td>
                    <td>800 Meters</td>
                    <td>1500 Meters</td>
                    <td>3000 Meters</td>
                    <td>5000 Meters</td>
                    </tr>
                    <tr>
                    <td>Time</td>
                    <td>N/A</td>
                    <td>43.03</td>
                    <td>1:40.91</td>
                    <td>3:26.00</td>
                    <td>7:20.67</td>
                    <td>12:35.36</td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}

export default Comparison
