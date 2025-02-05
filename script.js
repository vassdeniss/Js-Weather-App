const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const cityName = document.getElementById('city-name');
const temperature = document.getElementById('temperature');
const weatherCondition = document.getElementById('weather-condition');
const weatherIcon = document.getElementById('weather-icon');
const windSpeed = document.getElementById('wind-speed');
const loading = document.getElementById('loading');
const error = document.getElementById('error');

searchForm.addEventListener('submit', (e) => {
  e.preventDefault(); // Prevent the form from refreshing the page
  const city = searchInput.value.trim(); // Get the city name from the input
  if (city) {
    fetchWeather(city); // Fetch weather data for the entered city
  } else {
    showError('Please enter a city name.'); // Show error if input is empty
  }
});

const geocodingUrl = 'https://geocoding-api.open-meteo.com/v1/search?name=';

async function fetchWeather(city) {
  try {
    showLoading();

    const geocodingResponse = await fetch(`${geocodingUrl}${city}&count=1`);
    if (!geocodingResponse.ok) {
      throw new Error('City was not found');
    }

    const geocodingData = await geocodingResponse.json();
    if (!geocodingData.results) {
      throw new Error('City was not found');
    }

    const { latitude, longitude, name } = geocodingData.results[0];
    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
    );
    if (!weatherResponse.ok) {
      throw new Error('Unable to fetch weather data.');
    }

    const weatherData = await weatherResponse.json();

    displayWeather(name, weatherData);
  } catch (err) {
    showError(err.message);
  } finally {
    hideLoading();
  }
}

function displayWeather(city, data) {
  const { current_weather } = data;

  cityName.textContent = city;
  temperature.textContent = `${current_weather.temperature}°C`;
  weatherCondition.textContent = getWeatherCondition(
    current_weather.weathercode
  );
  windSpeed.textContent = `Wind Speed: ${current_weather.windspeed} m/s`;

  // Update weather icon
  const iconClass = getWeatherIcon(current_weather.weathercode);
  weatherIcon.className = `fas ${iconClass}`; // Set Font Awesome class
  weatherIcon.setAttribute('aria-label', weatherCondition.textContent); // Accessibility

  error.textContent = ''; // Clear any previous error messages
}

function getWeatherCondition(weathercode) {
  const weatherConditions = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail',
  };
  return weatherConditions[weathercode] || 'Unknown';
}

function getWeatherIcon(weathercode) {
  const iconMap = {
    0: 'fa-sun', // Clear sky
    1: 'fa-cloud-sun', // Mainly clear
    2: 'fa-cloud-sun', // Partly cloudy
    3: 'fa-cloud', // Overcast
    45: 'fa-smog', // Fog
    48: 'fa-smog', // Depositing rime fog
    51: 'fa-cloud-rain', // Light drizzle
    53: 'fa-cloud-rain', // Moderate drizzle
    55: 'fa-cloud-rain', // Dense drizzle
    56: 'fa-cloud-rain', // Light freezing drizzle
    57: 'fa-cloud-rain', // Dense freezing drizzle
    61: 'fa-cloud-showers-heavy', // Slight rain
    63: 'fa-cloud-showers-heavy', // Moderate rain
    65: 'fa-cloud-showers-heavy', // Heavy rain
    66: 'fa-cloud-meatball', // Light freezing rain
    67: 'fa-cloud-meatball', // Heavy freezing rain
    71: 'fa-snowflake', // Slight snow fall
    73: 'fa-snowflake', // Moderate snow fall
    75: 'fa-snowflake', // Heavy snow fall
    77: 'fa-snowflake', // Snow grains
    80: 'fa-cloud-showers-heavy', // Slight rain showers
    81: 'fa-cloud-showers-heavy', // Moderate rain showers
    82: 'fa-cloud-showers-heavy', // Violent rain showers
    85: 'fa-snowflake', // Slight snow showers
    86: 'fa-snowflake', // Heavy snow showers
    95: 'fa-bolt', // Thunderstorm
    96: 'fa-bolt', // Thunderstorm with slight hail
    99: 'fa-bolt', // Thunderstorm with heavy hail
  };
  return iconMap[weathercode] || 'fa-question'; // Default icon for unknown weather codes
}

function showLoading() {
  loading.style.display = 'block';
  error.style.display = 'none';
}

function hideLoading() {
  loading.style.display = 'none';
}

function showError(message) {
  error.textContent = message;
  error.style.display = 'block';
  cityName.textContent = '--';
  temperature.textContent = '--°C';
  weatherCondition.textContent = '--';
  humidity.textContent = 'Humidity: --%';
  windSpeed.textContent = 'Wind Speed: -- m/s';
  weatherIcon.src = '';
  weatherIcon.alt = '';
}
