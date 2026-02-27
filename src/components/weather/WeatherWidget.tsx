// Archivo: src/components/weather/WeatherWidget.tsx

import type { CurrentWeather } from '../../types/weather.types';
import './WeatherWidget.css';
import { CloudRain, Cloud, Sun, Snowflake, Zap, Wind, Loader2, AlertTriangle, Droplet } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Props {
    weatherData: CurrentWeather | undefined;
    isLoading: boolean;
    error: Error | null;
}

// Helper para obtener un ícono según la condición climática principal
const getWeatherIcon = (main: string): LucideIcon => {
    switch (main.toLowerCase()) {
        case 'rain': return CloudRain;
        case 'clouds': return Cloud;
        case 'clear': return Sun;
        case 'snow': return Snowflake;
        case 'drizzle': return CloudRain;
        case 'thunderstorm': return Zap;
        default: return Wind;
    }
};

const WeatherWidget = ({ weatherData, isLoading, error }: Props) => {
    if (isLoading) {
        return (
            <div className="weather-widget loading">
                <Loader2 size={20} />
                <span>Cargando clima...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="weather-widget error">
                <AlertTriangle size={20} />
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
                    {(() => { const WIcon = getWeatherIcon(weatherInfo.main); return <WIcon size={24} />; })()}
                    <span>{weatherInfo.description}</span>
                </div>
            </div>
            <div className="details">
                <div className="detail-item">
                    <Droplet size={14} />
                    <span>Humedad: {main.humidity}%</span>
                </div>
                <div className="detail-item">
                    <Wind size={14} />
                    <span>Viento: {wind.speed.toFixed(1)} km/h</span>
                </div>
            </div>
        </div>
    );
};

export default WeatherWidget;