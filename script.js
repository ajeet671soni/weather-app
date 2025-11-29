const cityInput = document.querySelector('.city-input');
const searchBtn = document.querySelector('.search-icon'); // Using the icon as button trigger if needed, or input enter
const searchContainer = document.querySelector('.search-container');

const weatherMainSection = document.querySelector('.weather-main');
const highlightsSection = document.querySelector('.highlights-section');
const forecastSection = document.querySelector('.forecast-section');

const notFoundOverlay = document.querySelector('.not-found-overlay');
const searchPromptOverlay = document.querySelector('.search-prompt-overlay');
const closeNotFoundBtn = document.querySelector('.close-btn');

// Large search overlay elements
const cityInputLarge = document.querySelector('.city-input-large');
const searchBtnLarge = document.querySelector('.search-btn-large');

// Elements to update
const tempTxt = document.querySelector('.temp-text');
const conditionTxt = document.querySelector('.condition-text');
const dateTxt = document.querySelector('.date-text');
const locationTxt = document.querySelector('.location-text');
const weatherIcon = document.querySelector('.weather-icon');
const cityNameOverlay = document.querySelector('.city-name-overlay');

// Highlights
const windSpeedTxt = document.querySelector('.wind-speed-txt');
const windDirectionTxt = document.querySelector('.wind-direction-txt');
const windDirectionIcon = document.querySelector('.wind-direction-icon');
const sunriseTxt = document.querySelector('.sunrise-txt');
const sunsetTxt = document.querySelector('.sunset-txt');
const humidityTxt = document.querySelector('.humidity-txt');
const humidityBar = document.querySelector('.humidity-bar');
const visibilityTxt = document.querySelector('.visibility-txt');
const visibilityStatus = document.querySelector('.visibility-status');
const pressureTxt = document.querySelector('.pressure-txt');
const pressureStatus = document.querySelector('.pressure-status');
const feelsLikeTxt = document.querySelector('.feels-like-txt');

const forecastContainer = document.querySelector('.forecast-container');

const apiKey = '9b21fd144cd1ced076dd44ee87c0fea6';

// Event Listeners
cityInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && cityInput.value.trim() !== '') {
    updateWeatherInfo(cityInput.value.trim());
    cityInput.blur();
  }
});

cityInputLarge.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && cityInputLarge.value.trim() !== '') {
    updateWeatherInfo(cityInputLarge.value.trim());
    cityInputLarge.blur();
  }
});

searchBtnLarge.addEventListener('click', () => {
  if (cityInputLarge.value.trim() !== '') {
    updateWeatherInfo(cityInputLarge.value.trim());
  }
});

closeNotFoundBtn.addEventListener('click', () => {
  notFoundOverlay.style.display = 'none';
  searchPromptOverlay.style.display = 'flex'; // Go back to search prompt
});

async function getFetchData(endPoint, city) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/${endPoint}?q=${city}&appid=${apiKey}&units=metric`;
  const response = await fetch(apiUrl);
  return response.json();
}

function getWeatherIcon(id) {
  if (id <= 232) return 'thunderstorm.svg';
  if (id <= 321) return 'drizzle.svg';
  if (id <= 531) return 'rain.svg';
  if (id <= 622) return 'snow.svg';
  if (id <= 781) return 'atmosphere.svg';
  if (id === 800) return 'clear.svg';
  return 'clouds.svg';
}

function getCurrentDate() {
  const currentDate = new Date();
  const options = {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  };
  return currentDate.toLocaleDateString('en-GB', options);
}

function formatTime(timestamp) {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function getWindDirection(deg) {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(deg / 45) % 8;
  return directions[index];
}

function getVisibilityStatus(visibility) {
  if (visibility >= 10000) return "Excellent";
  if (visibility >= 5000) return "Good";
  if (visibility >= 2000) return "Moderate";
  return "Poor";
}

function getPressureStatus(pressure) {
  if (pressure < 1000) return "Low";
  if (pressure > 1020) return "High";
  return "Normal";
}

async function updateWeatherInfo(city) {
  const weatherData = await getFetchData('weather', city);

  if (weatherData.cod !== 200) {
    notFoundOverlay.style.display = 'flex';
    return;
  }

  // Hide overlays on success
  notFoundOverlay.style.display = 'none';
  searchPromptOverlay.style.display = 'none';

  const {
    name: country,
    sys: { country: countryCode, sunrise, sunset },
    main: { temp, humidity, pressure, feels_like },
    weather: [{ id, main }],
    wind: { speed, deg },
    visibility
  } = weatherData;

  // Update Main Info
  locationTxt.textContent = `${country}, ${countryCode}`;
  tempTxt.textContent = Math.round(temp) + '°C';
  conditionTxt.textContent = main;
  dateTxt.textContent = getCurrentDate();
  weatherIcon.src = getWeatherIcon(id);
  cityNameOverlay.textContent = country;

  // Update Highlights
  windSpeedTxt.textContent = speed;
  windDirectionTxt.textContent = getWindDirection(deg);
  windDirectionIcon.style.transform = `rotate(${deg}deg)`; // Rotate icon

  sunriseTxt.textContent = formatTime(sunrise);
  sunsetTxt.textContent = formatTime(sunset);

  humidityTxt.textContent = humidity;
  humidityBar.style.width = `${humidity}%`;

  visibilityTxt.textContent = (visibility / 1000).toFixed(1);
  visibilityStatus.textContent = getVisibilityStatus(visibility);

  pressureTxt.textContent = pressure;
  pressureStatus.textContent = getPressureStatus(pressure);

  feelsLikeTxt.textContent = Math.round(feels_like);

  await updateForecastsInfo(city);
}

async function updateForecastsInfo(city) {
  const forecastsData = await getFetchData('forecast', city);

  const timeTaken = '12:00:00';
  const todayDate = new Date().toISOString().split('T')[0];

  forecastContainer.innerHTML = '';

  forecastsData.list.forEach(forecastWeather => {
    if (
      forecastWeather.dt_txt.includes(timeTaken) &&
      !forecastWeather.dt_txt.includes(todayDate)
    ) {
      updateForecastsItems(forecastWeather);
    }
  });
}

function updateForecastsItems(weatherData) {
  const {
    dt_txt: date,
    weather: [{ id }],
    main: { temp },
  } = weatherData;

  const dateTaken = new Date(date);
  const dateOptions = {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  };

  const dateResult = dateTaken.toLocaleDateString('en-GB', dateOptions);

  const forecastItem = `
    <div class="forecast-item">
      <h5 class="forecast-item-date">${dateResult}</h5>
      <img src="${getWeatherIcon(id)}" class="forecast-item-img" />
      <h5 class="forecast-item-temp">${Math.round(temp)} °C</h5>
    </div>
  `;

  forecastContainer.insertAdjacentHTML('beforeend', forecastItem);
}
