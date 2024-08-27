const API_KEY = '84181ec4d4fca8d96baf73a5ebfd7118';


const weather = document.getElementById("weather");
const city = document.getElementById("city");
const error = document.getElementById('error');

const units = 'imperial';
let temperatureSymbol = units == 'imperial' ? "°F" : "°C";

async function fetchWeather() {
    try {
        weather.innerHTML = '';
        error.innerHTML = '';
        city.innerHTML = '';

        const cityInput = document.getElementById('cityInput').value;

        // Fetching latitude and longitude using the city name
        const geoApiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${cityInput}&limit=1&appid=${API_KEY}`;
        const geoResponse = await fetch(geoApiUrl);
        const geoData = await geoResponse.json();

        if (!geoData.length) {
            error.innerHTML = `Please enter a valid city`;
            return;
        }

        const { lat, lon } = geoData[0];

        // Fetching 5-day weather forecast using latitude and longitude
        const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.cod === '404') {
            error.innerHTML = `City not found. Please try again.`;
            return;
        }

        // Filter data to get only one forecast per day (example 12PM each day)
        const dailyForecast = data.list.filter(item => item.dt_txt.includes("12:00:00"));

        dailyForecast.forEach(forecastData => {
            const weatherDiv = createWeatherDescription(forecastData);
            weather.appendChild(weatherDiv);
        });

        // Display city name and update title
        city.innerHTML = `5 Day Forecast for ${data.city.name}`;

    } catch (error) {
        console.log(error);
    }
}

// Convert to local time
function convertToLocalTime(dt) {
    const date = new Date(dt * 1000);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function createWeatherDescription(weatherData) {
    const { main, weather, dt } = weatherData;
    const description = document.createElement("div");

    const convertedDate = convertToLocalTime(dt);
    description.innerHTML = `
        <div class="weather_description">
            <strong>${convertedDate}</strong>: ${main.temp}${temperatureSymbol}, ${weather[0].description}
        </div>
    `;
    return description;
}
