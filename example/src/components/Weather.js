import React from 'react'
import axios from "axios"
import UserStore from './pages/Login/Stores/UserStore';

import './Weather.css'

class Weather extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            address: UserStore.address,
            city: '',
            stateLocation: '',
            country: '',
            image: '',
            temperature: '',
            description: '',
            correctAddress: false,
            firstRender: true,
        };
    }

    parseAddress = (e) => {
        if (this.state.address !== "") {
            var locations = this.state.address.split(', ');
            if (locations.length > 3) {
                this.setState({ city: locations[1] })
                this.setState({ stateLocation: locations[2] })
                this.setState({ country: locations[3] })
            } else {
                this.setState({ city: locations[0] })
                this.setState({ stateLocation: locations[1] })
                this.setState({ country: locations[2] })
            }
            setTimeout(() => {
                if (locations[3] !== "") {
                    this.setState({ correctAddress: true })
                    this.getWeatherData();
                }
            }, 200)
        }
    }

    getWeatherData = (e) => {
        axios({
            method: "GET",
            url: `https://api.openweathermap.org/data/2.5/weather?q=${this.state.city},${this.state.stateLocation},${this.state.country.substring(0, 2)}&APPID=719468e4ea4b7c43de1783e561e69f67`
        })
            // console logging for debugging
            .then((response) => {
                console.log(response.data);
                // Kelvin to Fahrenheit
                this.setState({ temperature: Math.floor(((response.data.main.temp-273.15)*1.8)+32) })
                this.setState({ description: response.data.weather[0].main })
                this.setState({ image: response.data.weather[0].icon })
            })
            // error handeling
            .catch((error) => {
                console.log(error);
            })
    }

    render() {
        if (this.state.firstRender) {
            this.parseAddress();
            this.setState({ firstRender: false })
        }
        if (!this.state.correctAddress) {
            return (
                <div className='weather-container'>
                    <h1 style={{ background: "" }} className='weather-text'>
                        Weather
                    </h1>
                    <div style={{ whiteSpace: "pre-wrap" }}>
                        A correct address has not been specified.
                    </div>
                </div>
            )
        } else {
            return (
                <div className='weather-container'>
                    <h1 style={{ background: "" }} className='weather-text'>
                        {this.state.city} Weather
                    </h1>
                    <div style={{ whiteSpace: "pre-wrap" }}>
                        {new Date().toLocaleString()}
                        {'\n'}
                        {this.state.temperature} °F - {this.state.description}
                        {'\n'}
                        <img src={`https://openweathermap.org/img/w/${this.state.image}.png`} alt='Icon for weather'/>
                    </div>
                </div>
            )
        }
    }
}

export default Weather
