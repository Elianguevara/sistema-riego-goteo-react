// Archivo: src/components/irrigation/DailyIrrigationView.tsx

import { useState, useEffect, useRef } from 'react';
import type { MonthlyIrrigationSectorView } from '../../types/irrigation.types';
import type { Sector } from '../../types/farm.types';
import type { CurrentWeather } from '../../types/weather.types'; // 1. IMPORTAR TIPO
import IrrigationForm from './IrrigationForm';
import PrecipitationForm from '../precipitation/PrecipitationForm';
import './DailyIrrigationView.css';

// 2. ACTUALIZAR LA INTERFAZ DE PROPS
interface DailyViewProps {
    farmId: number;
    sectors: Sector[];
    monthlyData: MonthlyIrrigationSectorView[];
    year: number;
    month: number;
    weatherData: CurrentWeather | undefined;
    isLoadingWeather: boolean;
    weatherError: Error | null;
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

const DailyIrrigationView = ({ farmId, sectors, monthlyData, year, month, weatherData, isLoadingWeather, weatherError }: DailyViewProps) => {
    const [irrigationModal, setIrrigationModal] = useState<{ sectorId: number; date: string; } | null>(null);
    const [precipitationModalDate, setPrecipitationModalDate] = useState<string | null>(null);
    const todayRef = useRef<HTMLDivElement>(null);

    const daysInMonth = new Date(year, month, 0).getDate();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    useEffect(() => {
        setTimeout(() => {
            todayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    }, [month, year]); // Se activa al cambiar de mes

    const irrigationMap = new Map<string, any[]>();
    const precipitationMap = new Map<string, any[]>();

    monthlyData.forEach(sectorView => {
        Object.entries(sectorView.dailyIrrigations).forEach(([day, details]) => {
            irrigationMap.set(`${sectorView.sectorId}-${day}`, details);
        });
        if (sectorView.dailyPrecipitations) {
             Object.entries(sectorView.dailyPrecipitations).forEach(([day, details]) => {
                precipitationMap.set(String(day), details);
            });
        }
    });

    const now = new Date();
    const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return (
        <>
            <div className="daily-view-container">
                {daysArray.map(day => {
                    const date = new Date(year, month - 1, day);
                    const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    
                    let dayClass = date < todayDate ? 'past' : (date.getTime() === todayDate.getTime() ? 'today' : 'future');
                    
                    const dailyPrecipitation = precipitationMap.get(String(day));
                    const totalRain = dailyPrecipitation?.reduce((sum, rec) => sum + (rec?.mmRain || 0), 0) || 0;

                    return (
                        <div key={day} className={`day-card ${dayClass}`} ref={dayClass === 'today' ? todayRef : null}>
                            <div className="day-card-header">
                                <span>{date.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric' })}</span>
                                <div className="header-actions">
                                    
                                    {/* --- 3. WIDGET DE CLIMA INTEGRADO --- */}
                                    {dayClass === 'today' && (
                                        <div className="current-weather-display">
                                            {isLoadingWeather ? (
                                                <><i className="fas fa-spinner fa-spin"></i> Cargando...</>
                                            ) : weatherError ? (
                                                <><i className="fas fa-exclamation-circle" title={weatherError.message}></i> Clima no disponible</>
                                            ) : weatherData && (
                                                <>
                                                    <i className={getWeatherIcon(weatherData.weather[0].main)}></i>
                                                    <strong>{Math.round(weatherData.main.temp)}°C</strong>
                                                    <span className="weather-description">{weatherData.weather[0].description}</span>
                                                </>
                                            )}
                                        </div>
                                    )}

                                    {totalRain > 0 && (
                                        <div className="daily-precipitation-display">
                                            <i className="fas fa-cloud-showers-heavy"></i>
                                            <span>{totalRain.toFixed(1)} mm</span>
                                        </div>
                                    )}
                                    <button className="btn-add-precipitation" onClick={() => setPrecipitationModalDate(dateString)}>
                                        <i className="fas fa-cloud-rain"></i> Añadir Lluvia
                                    </button>
                                </div>
                            </div>
                            
                            <div className="sector-list">
                                {/* ... (El resto del componente no cambia) ... */}
                            </div>
                        </div>
                    );
                })}
            </div>

            {irrigationModal && (
                <IrrigationForm
                    farmId={farmId}
                    sectorId={irrigationModal.sectorId}
                    date={irrigationModal.date}
                    onClose={() => setIrrigationModal(null)}
                />
            )}
            
            {precipitationModalDate && (
                <PrecipitationForm
                    farmId={farmId}
                    onClose={() => setPrecipitationModalDate(null)}
                />
            )}
        </>
    );
};

export default DailyIrrigationView;