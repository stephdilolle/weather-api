const weatherDetails = document.getElementById("weather-details");
const city = document.getElementById("city");
const error = document.getElementById("error");
const historyList = document.getElementById("history");
let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];

const units = 'imperial';
let temperatureSymbol = units == 'imperial' ? "°F" : "°C";
const API_KEY = '84181ec4d4fca8d96baf73a5ebfd7118';

// Fetch weather data
async function fetchWeather(cityInput) {
    try {
        weatherDetails.innerHTML = '';
        error.innerHTML = '';
        city.innerHTML = '';

        // Get latitude and longitude using city name
        const geoApiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${cityInput}&limit=1&appid=${API_KEY}`;
        const geoResponse = await fetch(geoApiUrl);
        const geoData = await geoResponse.json();

        if (!geoData.length) {
            error.innerHTML = `Please enter a valid city`;
            return;
        }

        const { lat, lon } = geoData[0];

        // Get current weather
        const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`;
        const currentResponse = await fetch(currentWeatherUrl);
        const currentWeatherData = await currentResponse.json();

        // Get 5-day forecast
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`;
        const forecastResponse = await fetch(forecastUrl);
        const forecastData = await forecastResponse.json();

        // Display current weather
        displayCurrentWeather(currentWeatherData);

        // Display 5-day forecast
        display5DayForecast(forecastData);

        // Add city to search history
        addToSearchHistory(cityInput);

    } catch (error) {
        console.error(error);
    }
}

// Display current weather
function displayCurrentWeather(currentWeather) {
    const { name, main, weather, wind, dt } = currentWeather;
    const date = convertToLocalTime(dt);
    city.innerHTML = `Current Weather in ${name} (${date})`;

    const currentWeatherDiv = document.createElement("div");
    currentWeatherDiv.innerHTML = `
        <h2>${name}</h2>
        <p>Date: ${date}</p>
        <img src="https://openweathermap.org/img/wn/${weather[0].icon}@2x.png" alt="${weather[0].description}">
        <p>Temperature: ${main.temp}${temperatureSymbol}</p>
        <p>Humidity: ${main.humidity}%</p>
        <p>Wind Speed: ${wind.speed} mph</p>
    `;
    weatherDetails.appendChild(currentWeatherDiv);
}

// Display 5-day forecast
function display5DayForecast(forecastData) {
    const dailyForecast = forecastData.list.filter(item => item.dt_txt.includes("12:00:00"));
    
    const forecastDiv = document.createElement("div");
    forecastDiv.innerHTML = '<h3>5-Day Forecast:</h3>';
    
    dailyForecast.forEach(forecast => {
        const { dt, main, weather, wind } = forecast;
        const date = convertToLocalTime(dt);

        const forecastItem = document.createElement("div");
        forecastItem.innerHTML = `
            <p><strong>${date}</strong></p>
            <img src="https://openweathermap.org/img/wn/${weather[0].icon}@2x.png" alt="${weather[0].description}">
            <p>Temperature: ${main.temp}${temperatureSymbol}</p>
            <p>Humidity: ${main.humidity}%</p>
            <p>Wind Speed: ${wind.speed} mph</p>
        `;
        forecastDiv.appendChild(forecastItem);
    });

    weatherDetails.appendChild(forecastDiv);
}

// Convert Unix timestamp to local time
function convertToLocalTime(dt) {
    const date = new Date(dt * 1000);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}-${day}-${year}`;
}

// Add city to search history
function addToSearchHistory(cityInput) {
    if (!searchHistory.includes(cityInput)) {
        searchHistory.push(cityInput);
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
        updateSearchHistoryUI();
    }
}

// Update search history UI
function updateSearchHistoryUI() {
    historyList.innerHTML = '';
    searchHistory.forEach(city => {
        const historyItem = document.createElement("button");
        historyItem.textContent = city;
        historyItem.onclick = () => fetchWeather(city);
        historyList.appendChild(historyItem);
    });
}

// Initialize search history on page load
updateSearchHistoryUI();

// Event listener for search button
document.getElementById('searchButton').addEventListener('click', () => {
    const cityInput = document.getElementById('cityInput').value;
    fetchWeather(cityInput);
});
