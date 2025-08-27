// Archivo: src/components/weather/WeatherWidget.tsx

import type { CurrentWeather } from '../../types/weather.types';
import './WeatherWidget.css';

interface Props {
    weatherData: CurrentWeather | undefined;
    isLoading: boolean;
    error: Error | null;
}

// Helper para obtener un ícono según la condición climática principal
const getWeatherIcon = (main: string) => {
    switch (main.toLowerCase()) {
        case 'rain': return 'fas fa-cloud-showers-heavy';
        case 'clouds': return 'fas fa-cloud';
        case 'clear': return 'fas fa-sun';
        case 'snow': return 'fas fa-snowflake';
        case 'drizzle': return 'fas fa-cloud-rain';
        case 'thunderstorm': return 'fas fa-bolt';
        default: return 'fas fa-smog';
    }
};

const WeatherWidget = ({ weatherData, isLoading, error }: Props) => {
    if (isLoading) {
        return (
            <div className="weather-widget loading">
                <i className="fas fa-spinner fa-spin"></i>
                <span>Cargando clima...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="weather-widget error">
                <i className="fas fa-exclamation-circle"></i>
                <span>{error.message}</span>
            </div>
        );
    }

    if (!weatherData) {
        return null; // No renderizar nada si no hay datos
    }
    
    const { main, weather, wind } = weatherData;
    const weatherInfo = weather[0];

    return (
        <div className="weather-widget">
            <div className="main-info">
                <div className="temp">{Math.round(main.temp)}°C</div>
                <div className="condition">
                    <i className={getWeatherIcon(weatherInfo.main)}></i>
                    <span>{weatherInfo.description}</span>
                </div>
            </div>
            <div className="details">
                <div className="detail-item">
                    <i className="fas fa-tint"></i>
                    <span>Humedad: {main.humidity}%</span>
                </div>
                <div className="detail-item">
                    <i className="fas fa-wind"></i>
                    <span>Viento: {wind.speed.toFixed(1)} km/h</span>
                </div>
            </div>
        </div>
    );
};

export default WeatherWidget;