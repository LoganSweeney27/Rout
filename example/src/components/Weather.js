import React, { useState } from 'react'
import axios from "axios"

import './Weather.css'

const Weather = () => {
    const [temperature, setTemperature] = useState("Temp")
    const [description, setDescription] = useState("Desc")
    const [image, setImage] = useState("")
    // const [city, setCity] = useState("West Lafayette");
    // const [country, setCountry] = useState("US");

    const city = "West Lafayette"
    const state = "IN"
    const country = "US"

    const getWeatherData = (city, state, country) => {
        axios({
            method: "GET",
            url: `https://api.openweathermap.org/data/2.5/weather?q=${city},${state},${country}&APPID=719468e4ea4b7c43de1783e561e69f67`
        })
            // console logging for debugging
            .then((response) => {
                console.log(response.data);
                // Kelvin to Fahrenheit
                setTemperature(Math.floor(((response.data.main.temp-273.15)*1.8)+32))
                setDescription(response.data.weather[0].main)
                setImage(response.data.weather[0].icon)
            })
            // error handeling
            .catch((error) => {
                console.log(error);
            })
    };

    return (
        <div className='weather-container'>
            {/* Could use input fields like <input type="text" value={city} onChange={(e) => setCity(e.target.value)} /> */}
            <h1 style={{ background: "" }} className='weather-text'>
                {city} Weather
            </h1>
            <div style={{ whiteSpace: "pre-wrap" }}>
                {/* {getWeatherData(city, state, country)} */}
                {new Date().toLocaleString()}
                {'\n'}
                {temperature} °F - {description}
                {'\n'}
                <img src={`https://openweathermap.org/img/w/${image}.png`} alt='Icon for weather'/>
            </div>
            <button onClick={() => { getWeatherData(city, state, country) }}>
                GET
            </button>
        </div>
    )
}

export default Weather
