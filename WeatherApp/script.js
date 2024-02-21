const apiKey = '9de97a857a667ce9892fab5a6db02240';
const locButton = document.querySelector('.loc-button');
const locInput = document.querySelector('.loc-input');
const todayInfo = document.querySelector('.today-info');
const todayWeatherIcon = document.querySelector('.today-weather i');
const todayTemp = document.querySelector('.weather-temp');
const daysList = document.querySelector('.days-list');

// Mapping of weather condition codes to icon class names (Depending on Openweather Api Response)
const weatherIconMap = {
    '01d': 'sun',
    '01n': 'moon',
    '02d': 'sun',
    '02n': 'moon',
    '03d': 'cloud',
    '03n': 'cloud',
    '04d': 'cloud',
    '04n': 'cloud',
    '09d': 'cloud-rain',
    '09n': 'cloud-rain',
    '10d': 'cloud-rain',
    '10n': 'cloud-rain',
    '11d': 'cloud-lightning',
    '11n': 'cloud-lightning',
    '13d': 'cloud-snow',
    '13n': 'cloud-snow',
    '50d': 'water',
    '50n': 'water'
};

// Mapping of weather descriptions to Portuguese (pt-BR)
const weatherDescriptionMap = {
    'clear': 'Ensolarado',
    'clear sky': 'Céu Limpo',
    'few clouds': 'Poucas Nuvens',
    'scattered clouds': 'Nuvens Dispersas',
    'broken clouds': 'Nuvens Quebradas',
    'overcast clouds': 'Nublado',
    'shower rain': 'Chuva de Verão',
    'rain': 'Chuva',
    'light rain': 'Chuva Leve',
    'thunderstorm': 'Trovoadas',
    'snow': 'Neve',
    'mist': 'Nevoeiro',
    // Adicione outras traduções conforme necessário
};

function fetchWeatherData(location) {
    // Construct the API url with the location and api key
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${apiKey}&units=metric`;

    // Fetch weather data from api
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            // Update today's info
            const todayWeather = data.list[0].weather[0].description.toLowerCase();
            const todayTemperature = `${Math.round(data.list[0].main.temp)}°C`;
            const todayWeatherIconCode = data.list[0].weather[0].icon;

            todayInfo.querySelector('h2').textContent = new Date().toLocaleDateString('pt-BR', { weekday: 'long' });
            todayInfo.querySelector('span').textContent = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
            todayWeatherIcon.className = `bx bx-${weatherIconMap[todayWeatherIconCode]}`;
            todayTemp.textContent = todayTemperature;

            // Update location and weather description in the "left-info" section
            const locationElement = document.querySelector('.today-info > div > span');
            locationElement.textContent = `${data.city.name}, ${data.city.country}`;

            const weatherDescriptionElement = document.querySelector('.today-weather > h3');
            weatherDescriptionElement.textContent = weatherDescriptionMap[todayWeather] || todayWeather;

            // Update today's info in the "day-info" section
            const todayPrecipitation = `${data.list[0].pop}%`;
            const todayHumidity = `${data.list[0].main.humidity}%`;
            const todayWindSpeed = `${data.list[0].wind.speed} km/h`;

            const dayInfoContainer = document.querySelector('.day-info');
            dayInfoContainer.innerHTML = `
                <div>
                    <span class="title">PRECIPITAÇÃO</span>
                    <span class="value">${todayPrecipitation}</span>
                </div>
                <div>
                    <span class="title">UMIDADE</span>
                    <span class="value">${todayHumidity}</span>
                </div>
                <div>
                    <span class="title">VELOCIDADE DO VENTO</span>
                    <span class="value">${todayWindSpeed}</span>
                </div>
            `;

            // Update next 4 days weather
            const today = new Date();
            const nextDaysData = data.list.slice(1);

            const uniqueDays = new Set();
            let count = 0;
            daysList.innerHTML = '';
            for (const dayData of nextDaysData) {
                const forecastDate = new Date(dayData.dt_txt);
                const dayAbbreviation = forecastDate.toLocaleDateString('pt-BR', { weekday: 'short' });
                const dayTemp = `${Math.round(dayData.main.temp)}°C`;
                const iconCode = dayData.weather[0].icon;

                // Ensure the day isn't duplicate and today
                if (!uniqueDays.has(dayAbbreviation) && forecastDate.getDate() !== today.getDate()) {
                    uniqueDays.add(dayAbbreviation);
                    daysList.innerHTML += `
                        <li>
                            <i class='bx bx-${weatherIconMap[iconCode]}'></i>
                            <span>${dayAbbreviation}</span>
                            <span class="day-temp">${dayTemp}</span>
                        </li>
                    `;
                    count++;
                }

                // Stop after getting 4 distinct days
                if (count === 4) break;
            }
        })
        .catch(error => {
            alert(`Erro ao buscar dados climáticos: ${error} (Erro na API)`);
        });
}

function fetchWeatherDataByGeolocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`)
                .then(response => response.json())
                .then(data => {
                    const location = `${data.name}, ${data.sys.country}`;
                    fetchWeatherData(location);
                })
                .catch(error => {
                    alert(`Erro ao buscar dados climáticos: ${error} (Erro de Geolocalização)`);
                });
        });
    } else {
        alert('Geolocalização não é suportada por este navegador.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchWeatherDataByGeolocation();
});

locButton.addEventListener('click', () => {
    const location = locInput.value.trim();
    if (location === '') {
        alert('Por favor, insira uma localização.');
        return;
    }
    fetchWeatherData(location);
});

document.querySelector('.search-box').addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        locButton.click();
    }
});
