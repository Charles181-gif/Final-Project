// Weather API Integration for Health Recommendations
// This satisfies the third-party API requirement for the project

class WeatherHealthAPI {
    constructor() {
        // Using OpenWeatherMap API (free tier)
        this.apiKey = this.resolveApiKey();
        this.baseUrl = 'https://api.openweathermap.org/data/2.5';
    }

    resolveApiKey() {
        // Priority: window.APP_CONFIG -> localStorage -> placeholder
        const fromConfig = typeof window !== 'undefined' && window.APP_CONFIG && window.APP_CONFIG.OPENWEATHER_API_KEY;
        const fromStorage = typeof window !== 'undefined' && window.localStorage && localStorage.getItem('OPENWEATHER_API_KEY');
        return (fromConfig || fromStorage || '').trim();
    }

    setApiKey(key) {
        this.apiKey = (key || '').trim();
        try { localStorage.setItem('OPENWEATHER_API_KEY', this.apiKey); } catch (_) {}
    }

    // Get weather data for a location
    async getWeatherData(city = 'Accra', country = 'GH') {
        try {
            if (!this.apiKey) {
                console.warn('OpenWeather API key not set. Using fallback data.');
                return this.getFallbackWeatherData();
            }
            const response = await fetch(
                `${this.baseUrl}/weather?q=${city},${country}&appid=${this.apiKey}&units=metric`
            );
            
            if (!response.ok) {
                throw new Error('Weather data not available');
            }
            
            const data = await response.json();
            return this.processWeatherData(data);
        } catch (error) {
            console.error('Weather API Error:', error);
            return this.getFallbackWeatherData();
        }
    }

    // Process weather data and generate health recommendations
    processWeatherData(weatherData) {
        const { main, weather, wind, humidity } = weatherData;
        const temperature = main.temp;
        const condition = weather[0].main.toLowerCase();
        const windSpeed = wind.speed;

        return {
            temperature: Math.round(temperature),
            condition: condition,
            humidity: humidity,
            windSpeed: windSpeed,
            healthRecommendations: this.generateHealthRecommendations(temperature, condition, humidity, windSpeed),
            riskLevel: this.calculateHealthRisk(temperature, condition, humidity)
        };
    }

    // Generate health recommendations based on weather
    generateHealthRecommendations(temperature, condition, humidity, windSpeed) {
        const recommendations = [];

        // Temperature-based recommendations
        if (temperature > 30) {
            recommendations.push({
                type: 'warning',
                message: 'High temperature detected. Stay hydrated and avoid prolonged sun exposure.',
                icon: 'fas fa-thermometer-half'
            });
        } else if (temperature < 15) {
            recommendations.push({
                type: 'info',
                message: 'Cool weather. Consider wearing warm clothing to prevent cold-related illnesses.',
                icon: 'fas fa-thermometer-empty'
            });
        }

        // Humidity-based recommendations
        if (humidity > 80) {
            recommendations.push({
                type: 'warning',
                message: 'High humidity. Be aware of increased risk of respiratory issues.',
                icon: 'fas fa-tint'
            });
        }

        // Weather condition recommendations
        if (condition.includes('rain')) {
            recommendations.push({
                type: 'info',
                message: 'Rainy weather. Be cautious of slippery surfaces and consider indoor activities.',
                icon: 'fas fa-cloud-rain'
            });
        }

        if (condition.includes('storm')) {
            recommendations.push({
                type: 'danger',
                message: 'Storm conditions. Stay indoors and avoid outdoor activities.',
                icon: 'fas fa-bolt'
            });
        }

        // Wind-based recommendations
        if (windSpeed > 20) {
            recommendations.push({
                type: 'warning',
                message: 'High winds. Be cautious of dust and debris that may affect respiratory health.',
                icon: 'fas fa-wind'
            });
        }

        // General health tips
        recommendations.push({
            type: 'success',
            message: 'Remember to maintain regular exercise and healthy eating habits regardless of weather.',
            icon: 'fas fa-heart'
        });

        return recommendations;
    }

    // Calculate health risk level
    calculateHealthRisk(temperature, condition, humidity) {
        let riskScore = 0;

        // Temperature risk
        if (temperature > 35 || temperature < 10) riskScore += 3;
        else if (temperature > 30 || temperature < 15) riskScore += 2;
        else if (temperature > 25 || temperature < 20) riskScore += 1;

        // Humidity risk
        if (humidity > 90) riskScore += 2;
        else if (humidity > 80) riskScore += 1;

        // Weather condition risk
        if (condition.includes('storm')) riskScore += 3;
        else if (condition.includes('rain')) riskScore += 1;

        // Risk levels: 0-2 = Low, 3-5 = Medium, 6+ = High
        if (riskScore >= 6) return 'high';
        else if (riskScore >= 3) return 'medium';
        else return 'low';
    }

    // Fallback data for when API is unavailable
    getFallbackWeatherData() {
        return {
            temperature: 28,
            condition: 'clear',
            humidity: 75,
            windSpeed: 5,
            healthRecommendations: [
                {
                    type: 'info',
                    message: 'Weather data temporarily unavailable. Please check local weather conditions.',
                    icon: 'fas fa-info-circle'
                },
                {
                    type: 'success',
                    message: 'Remember to maintain regular exercise and healthy eating habits.',
                    icon: 'fas fa-heart'
                }
            ],
            riskLevel: 'low'
        };
    }

    // Display weather health widget
    displayWeatherWidget(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const { city, country } = this.resolveUserLocation();
        this.getWeatherData(city, country).then(data => {
            const widget = this.createWeatherWidget(data);
            container.innerHTML = widget;
        }).catch(() => {
            const widget = this.createWeatherWidget(this.getFallbackWeatherData());
            container.innerHTML = widget;
        });
    }

    resolveUserLocation() {
        // Try to infer city from stored profile; fallback to Accra, GH
        try {
            const profileRaw = sessionStorage.getItem('userProfile');
            if (profileRaw) {
                const profile = JSON.parse(profileRaw);
                let city = profile.city || profile.location || 'Accra';
                if (typeof city === 'string') {
                    // Extract first part if contains comma
                    city = city.split(',')[0].trim();
                }
                return { city: city || 'Accra', country: 'GH' };
            }
        } catch (_) {}
        return { city: 'Accra', country: 'GH' };
    }

    // New: Fetch using device geolocation when available/allowed
    async tryGetGeolocation(timeoutMs = 6000) {
        if (!('geolocation' in navigator)) return null;
        return new Promise((resolve) => {
            let resolved = false;
            const onSuccess = (pos) => {
                if (resolved) return; resolved = true;
                resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude });
            };
            const onError = () => {
                if (resolved) return; resolved = true; resolve(null);
            };
            const opts = { enableHighAccuracy: false, timeout: timeoutMs, maximumAge: 300000 };
            try { navigator.geolocation.getCurrentPosition(onSuccess, onError, opts); }
            catch (_) { resolve(null); }
            setTimeout(() => { if (!resolved) { resolved = true; resolve(null); } }, timeoutMs + 200);
        });
    }

    async getWeatherByCoordinates(lat, lon) {
        try {
            if (!this.apiKey) {
                console.warn('OpenWeather API key not set. Using fallback data.');
                return this.getFallbackWeatherData();
            }
            const response = await fetch(
                `${this.baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`
            );
            if (!response.ok) throw new Error('Weather data not available');
            const data = await response.json();
            return this.processWeatherData(data);
        } catch (e) {
            console.error('Weather API (geo) Error:', e);
            return this.getFallbackWeatherData();
        }
    }

    // Override to prefer geolocation when possible
    async displayWeatherWidget(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const coords = await this.tryGetGeolocation().catch(() => null);
        let data;
        if (coords && typeof coords.lat === 'number' && typeof coords.lon === 'number') {
            data = await this.getWeatherByCoordinates(coords.lat, coords.lon);
        } else {
            const { city, country } = this.resolveUserLocation();
            data = await this.getWeatherData(city, country);
        }
        const widget = this.createWeatherWidget(data);
        container.innerHTML = widget;
    }

    // Create weather widget HTML
    createWeatherWidget(data) {
        const riskClass = `risk-${data.riskLevel}`;
        
        return `
            <div class="weather-health-widget ${riskClass}">
                <div class="weather-header">
                    <h3><i class="fas fa-cloud-sun"></i> Weather Health Alert</h3>
                    <div class="weather-info">
                        <span class="temperature">${data.temperature}°C</span>
                        <span class="condition">${data.condition}</span>
                    </div>
                </div>
                
                <div class="health-recommendations">
                    <h4>Health Recommendations:</h4>
                    ${data.healthRecommendations.map(rec => `
                        <div class="recommendation ${rec.type}">
                            <i class="${rec.icon}"></i>
                            <span>${rec.message}</span>
                        </div>
                    `).join('')}
                </div>
                
                <div class="risk-indicator">
                    <span class="risk-label">Risk Level: </span>
                    <span class="risk-value ${data.riskLevel}">${data.riskLevel.toUpperCase()}</span>
                </div>
            </div>
        `;
    }

    // Update weather data periodically
    startWeatherUpdates(containerId, intervalMinutes = 30) {
        this.displayWeatherWidget(containerId);
        
        setInterval(() => {
            this.displayWeatherWidget(containerId);
        }, intervalMinutes * 60 * 1000);
    }
}

// Initialize weather API
const weatherAPI = new WeatherHealthAPI();

// Export for use in other files
window.weatherAPI = weatherAPI;

// Auto-initialize if weather widget container exists
document.addEventListener('DOMContentLoaded', function() {
    const weatherContainer = document.getElementById('weather-widget');
    if (weatherContainer) {
        weatherAPI.startWeatherUpdates('weather-widget');
    }
});

// Example usage functions
function showWeatherHealthAlert() {
    weatherAPI.getWeatherData().then(data => {
        const alertMessage = `Weather Alert: ${data.temperature}°C, ${data.condition}. Risk Level: ${data.riskLevel.toUpperCase()}`;
        utils.showSuccess(alertMessage);
    });
}

function getHealthRecommendations() {
    return weatherAPI.getWeatherData().then(data => {
        return data.healthRecommendations;
    });
}
