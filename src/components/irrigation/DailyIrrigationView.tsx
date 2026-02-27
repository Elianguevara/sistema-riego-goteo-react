// Archivo: src/components/irrigation/DailyIrrigationView.tsx
// (Código completo corregido)

import { useState, useEffect, useRef } from 'react';
import type { MonthlyIrrigationSectorView } from '../../types/irrigation.types';
import type { Sector } from '../../types/farm.types';
import type { CurrentWeather } from '../../types/weather.types';
import IrrigationForm from './IrrigationForm';
import PrecipitationForm from '../precipitation/PrecipitationForm';
import './DailyIrrigationView.css';
import { CloudRain, Cloud, Sun, Snowflake, Zap, Wind, Loader2, AlertTriangle, Plus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

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

const getWeatherInfo = (main: string): { icon: LucideIcon, colorClass: string } => {
    const lowerMain = main.toLowerCase();
    switch (lowerMain) {
        case 'rain': return { icon: CloudRain, colorClass: 'weather-rainy' };
        case 'clouds': return { icon: Cloud, colorClass: 'weather-cloudy' };
        case 'clear': return { icon: Sun, colorClass: 'weather-sunny' };
        case 'snow': return { icon: Snowflake, colorClass: 'weather-snow' };
        case 'drizzle': return { icon: CloudRain, colorClass: 'weather-rainy' };
        case 'thunderstorm': return { icon: Zap, colorClass: 'weather-rainy' };
        default: return { icon: Wind, colorClass: 'weather-cloudy' };
    }
};

const MiniWeatherDisplay = ({ isLoading, error, data }: { isLoading: boolean, error: Error | null, data: CurrentWeather | undefined }) => {
    if (isLoading) return <div className="current-weather-display"><Loader2 size={14} /> Cargando...</div>;
    if (error) return <div className="current-weather-display"><AlertTriangle size={14} /> Clima N/A</div>;
    if (data?.main && data.weather?.[0]) {
        const weatherInfo = data.weather[0];
        const { icon: WeatherIcon, colorClass } = getWeatherInfo(weatherInfo.main);
        return (
            <div className="current-weather-display" title={weatherInfo.description}>
                <WeatherIcon size={16} className={colorClass} />
                <strong>{Math.round(data.main.temp)}°C</strong>
                <span className="weather-description">{weatherInfo.description}</span>
            </div>
        );
    }
    return null;
};

const DailyIrrigationView = ({ farmId, sectors, monthlyData, year, month, weatherData, isLoadingWeather, weatherError }: DailyViewProps) => {

    const [irrigationModal, setIrrigationModal] = useState<{ sector: Sector; date: string; } | null>(null);
    const [precipitationModalDate, setPrecipitationModalDate] = useState<string | null>(null);
    const todayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Scroll suave al día actual al cargar o cambiar mes/año
        setTimeout(() => {
            todayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100); // Pequeño retraso para asegurar que el elemento exista
    }, [month, year]); // Dependencias: mes y año

    const daysInMonth = new Date(year, month, 0).getDate();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // Mapas para acceder rápidamente a los datos de riego y precipitación por día/sector
    const irrigationMap = new Map<string, any[]>();
    const precipitationMap = new Map<string, number>();

    monthlyData.forEach(sectorView => {
        // Llenar mapa de riego
        Object.entries(sectorView.dailyIrrigations).forEach(([day, details]) => {
            irrigationMap.set(`${sectorView.sectorId}-${day}`, details);
        });
        // Llenar mapa de precipitación (nuevo formato simple)
        if (sectorView.dailyPrecipitations) {
            Object.entries(sectorView.dailyPrecipitations).forEach(([day, totalMm]) => {
                precipitationMap.set(String(day), Number(totalMm));
            });
        }
    });

    const now = new Date();
    // Obtener la fecha de hoy sin la hora para comparaciones precisas
    const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return (
        <>
            <div className="daily-view-container">
                {daysArray.map(day => {
                    const date = new Date(year, month - 1, day);
                    const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    let dayClass = date < todayDate ? 'past' : (date.getTime() === todayDate.getTime() ? 'today' : 'future');

                    const totalRain = precipitationMap.get(String(day)) || 0;

                    return (
                        <div key={day} className={`day-card ${dayClass}`} ref={dayClass === 'today' ? todayRef : null}>
                            <div className="day-card-header">
                                <div className="date-display">
                                    <span className="day-name">{date.toLocaleDateString('es-AR', { weekday: 'long' })}</span>
                                    <span className="day-number">{day}</span>
                                </div>

                                <div className="header-status-group">
                                    {totalRain > 0 && (
                                        <div className="daily-precipitation-display">
                                            <CloudRain size={14} />
                                            <span>{totalRain.toFixed(1)} mm</span>
                                        </div>
                                    )}
                                    {dayClass === 'today' && <MiniWeatherDisplay isLoading={isLoadingWeather} error={weatherError} data={weatherData} />}

                                    <button className="btn-add-precipitation" onClick={() => setPrecipitationModalDate(dateString)} title="Añadir lluvia">
                                        <Plus size={12} /> <CloudRain size={14} />
                                    </button>
                                </div>
                            </div>

                            <div className="sector-list">
                                {sectors.map(sector => {
                                    const dailyRecords = irrigationMap.get(`${sector.id}-${day}`);
                                    // Calcular totales (agua en m³, luego convertir a hL)
                                    const totalWaterM3 = dailyRecords?.reduce((sum, rec) => sum + (rec?.waterAmount || 0), 0) || 0;
                                    const totalWaterHl = totalWaterM3 * 10; // Conversión a hectolitros
                                    const totalHours = dailyRecords?.reduce((sum, rec) => sum + (rec?.irrigationHours || 0), 0) || 0;

                                    return (
                                        // Fila para cada sector
                                        <div key={sector.id} className="sector-row">
                                            <span className="sector-name">{sector.name}</span>
                                            {/* Mostrar datos si hubo riego, si no, botón para añadir */}
                                            {totalWaterHl > 0 ? (
                                                <div className="irrigation-data">
                                                    {/* **CAMBIO AQUÍ**: Mostrar agua en hL */}
                                                    <span className="water-amount">{totalWaterHl.toFixed(1)} hL</span>
                                                    <span className="hours">({totalHours.toFixed(1)} hs)</span>
                                                    {/* Botón para ver/editar (abre el mismo modal que añadir) */}
                                                    <button className="btn-view" onClick={() => setIrrigationModal({ sector, date: dateString })}>
                                                        Ver/Editar
                                                    </button>
                                                </div>
                                            ) : (
                                                /* Botón para añadir riego */
                                                <button className="btn-add-irrigation" onClick={() => setIrrigationModal({ sector, date: dateString })}>
                                                    <Plus size={14} /> Añadir Riego
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal para añadir/editar riego (se muestra condicionalmente) */}
            {irrigationModal && (
                <IrrigationForm
                    farmId={farmId}
                    sector={irrigationModal.sector}
                    date={irrigationModal.date}
                    onClose={() => setIrrigationModal(null)} // Función para cerrar el modal
                />
            )}

            {/* Modal para añadir precipitación (se muestra condicionalmente) */}
            {precipitationModalDate && (
                <PrecipitationForm
                    farmId={farmId}
                    date={precipitationModalDate}
                    onClose={() => setPrecipitationModalDate(null)} // Función para cerrar el modal
                />
            )}
        </>
    );
};

export default DailyIrrigationView;