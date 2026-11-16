// Weather App Logic using Fetch API & Open-Meteo API (No API key required)
const weatherForm = document.getElementById('weatherForm');
const cityInput = document.getElementById('cityInput');
const loadingSpinner = document.getElementById('loadingSpinner');
const errorAlert = document.getElementById('errorAlert');
const errorMessage = document.getElementById('errorMessage');
const weatherResult = document.getElementById('weatherResult');
const defaultPrompt = document.getElementById('defaultPrompt');

// Weather Display Elements
const cityNameEl = document.getElementById('cityName');
const weatherConditionEl = document.getElementById('weatherCondition');
const tempValueEl = document.getElementById('tempValue');
const windValueEl = document.getElementById('windValue');
const humidityValueEl = document.getElementById('humidityValue');
const windDirValueEl = document.getElementById('windDirValue');

// WMO Weather interpretation codes
function interpretWeatherCode(code) {
    const codes = {
        0: 'Clear sky',
        1: 'Mainly clear',
        2: 'Partly cloudy',
        3: 'Overcast',
        45: 'Foggy',
        48: 'Depositing rime fog',
        51: 'Light drizzle',
        53: 'Moderate drizzle',
        55: 'Dense drizzle',
        61: 'Slight rain',
        63: 'Moderate rain',
        65: 'Heavy rain',
        71: 'Slight snow fall',
        73: 'Moderate snow fall',
        75: 'Heavy snow fall',
        80: 'Slight rain showers',
        81: 'Moderate rain showers',
        82: 'Violent rain showers',
        95: 'Thunderstorm'
    };
    return codes[code] || 'Cloudy / Variable';
}

// Fetch Weather function
async function getWeatherData(city) {
    try {
        // UI reset to loading state
        errorAlert.classList.add('d-none');
        weatherResult.classList.add('d-none');
        defaultPrompt.classList.add('d-none');
        loadingSpinner.classList.remove('d-none');

        // Step 1: Geocoding via Open-Meteo Geocoding API
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
        const geoRes = await fetch(geoUrl);
        
        if (!geoRes.ok) {
            throw new Error('Failed to resolve city location.');
        }

        const geoData = await geoRes.json();
        if (!geoData.results || geoData.results.length === 0) {
            throw new Error(`City "${city}" not found. Please verify spelling.`);
        }

        const { latitude, longitude, name, country } = geoData.results[0];

        // Step 2: Fetch current weather for coordinates
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m`;
        const weatherRes = await fetch(weatherUrl);

        if (!weatherRes.ok) {
            throw new Error('Failed to fetch weather telemetry.');
        }

        const weatherData = await weatherRes.json();
        const current = weatherData.current;

        // Step 3: Populate DOM
        cityNameEl.textContent = `${name}, ${country || ''}`;
        weatherConditionEl.textContent = interpretWeatherCode(current.weather_code);
        tempValueEl.textContent = `${Math.round(current.temperature_2m)}°C`;
        windValueEl.textContent = `${current.wind_speed_10m} km/h`;
        humidityValueEl.textContent = `${current.relative_humidity_2m}%`;
        windDirValueEl.textContent = `${current.wind_direction_10m}°`;

        // Display results
        loadingSpinner.classList.add('d-none');
        weatherResult.classList.remove('d-none');
    } catch (err) {
        loadingSpinner.classList.add('d-none');
        errorMessage.textContent = err.message || 'An error occurred while fetching weather data.';
        errorAlert.classList.remove('d-none');
    }
}

// Event Listeners
weatherForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const city = cityInput.value.trim();
    if (city) {
        getWeatherData(city);
    }
});
