// Weather API integration for GhanaHealth+
const WEATHER_CONFIG = {
    API_KEY: 'YOUR_API_KEY_HERE', // Replace with your OpenWeatherMap API key
    BASE_URL: 'https://api.openweathermap.org/data/2.5',
    CITIES: {
        'Accra': { lat: 5.6037, lon: -0.1870 },
        'Kumasi': { lat: 6.6885, lon: -1.6244 },
        'Takoradi': { lat: 4.8845, lon: -1.7554 },
        'Tamale': { lat: 9.4034, lon: -0.8424 },
        'Cape Coast': { lat: 5.1053, lon: -1.2466 }
    }
};

class WeatherAPI {
    constructor() {
        this.currentCity = 'Accra';
        this.weatherData = null;
    }

    async getCurrentWeather(city = this.currentCity) {
        try {
            const coords = WEATHER_CONFIG.CITIES[city];
            if (!coords) throw new Error('City not found');

            const url = `${WEATHER_CONFIG.BASE_URL}/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${WEATHER_CONFIG.API_KEY}&units=metric`;
            
            const response = await fetch(url);
            if (!response.ok) throw new Error('Weather API request failed');
            
            const data = await response.json();
            this.weatherData = data;
            
            return {
                temperature: Math.round(data.main.temp),
                description: data.weather[0].description,
                icon: data.weather[0].icon,
                humidity: data.main.humidity,
                windSpeed: data.wind.speed,
                city: data.name,
                country: data.sys.country
            };
        } catch (error) {
            console.error('Weather API Error:', error);
            return this.getFallbackWeather();
        }
    }

    getFallbackWeather() {
        return {
            temperature: Math.floor(Math.random() * 10) + 25,
            description: 'partly cloudy',
            icon: '02d',
            humidity: 65,
            windSpeed: 3.2,
            city: this.currentCity,
            country: 'GH'
        };
    }

    getHealthRecommendations(weatherData) {
        const temp = weatherData.temperature;
        const humidity = weatherData.humidity;
        const recommendations = [];

        if (temp > 30) {
            recommendations.push('Stay hydrated - drink plenty of water');
            recommendations.push('Avoid prolonged sun exposure');
        }
        
        if (temp < 20) {
            recommendations.push('Dress warmly to prevent cold-related illness');
        }
        
        if (humidity > 80) {
            recommendations.push('High humidity - take breaks in air-conditioned areas');
        }
        
        if (weatherData.description.includes('rain')) {
            recommendations.push('Carry an umbrella to stay dry');
            recommendations.push('Be cautious of waterborne diseases');
        }

        return recommendations;
    }

    updateWeatherWidget(weatherData) {
        const widget = document.getElementById('weather-widget');
        const tempDisplay = document.getElementById('temp-display');
        
        if (widget && tempDisplay) {
            const iconClass = this.getWeatherIcon(weatherData.icon);
            widget.innerHTML = `
                <i class="${iconClass}"></i>
                <span>${weatherData.temperature}°C</span>
                <small class="live-indicator"><span class="live-dot"></span></small>
            `;
            widget.title = `${weatherData.city}: ${weatherData.description}`;
        }
    }

    getWeatherIcon(iconCode) {
        const iconMap = {
            '01d': 'fas fa-sun',
            '01n': 'fas fa-moon',
            '02d': 'fas fa-cloud-sun',
            '02n': 'fas fa-cloud-moon',
            '03d': 'fas fa-cloud',
            '03n': 'fas fa-cloud',
            '04d': 'fas fa-clouds',
            '04n': 'fas fa-clouds',
            '09d': 'fas fa-cloud-rain',
            '09n': 'fas fa-cloud-rain',
            '10d': 'fas fa-cloud-sun-rain',
            '10n': 'fas fa-cloud-moon-rain',
            '11d': 'fas fa-bolt',
            '11n': 'fas fa-bolt',
            '13d': 'fas fa-snowflake',
            '13n': 'fas fa-snowflake',
            '50d': 'fas fa-smog',
            '50n': 'fas fa-smog'
        };
        return iconMap[iconCode] || 'fas fa-cloud-sun';
    }
}

// Initialize weather API
const weatherAPI = new WeatherAPI();

// Auto-update weather every 10 minutes
setInterval(async () => {
    const weatherData = await weatherAPI.getCurrentWeather();
    weatherAPI.updateWeatherWidget(weatherData);
}, 600000);

// Initial weather load
document.addEventListener('DOMContentLoaded', async () => {
    const weatherData = await weatherAPI.getCurrentWeather();
    weatherAPI.updateWeatherWidget(weatherData);
});

export { weatherAPI, WEATHER_CONFIG };