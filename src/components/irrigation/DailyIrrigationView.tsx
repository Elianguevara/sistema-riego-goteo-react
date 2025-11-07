// Archivo: src/components/irrigation/DailyIrrigationView.tsx
// (Código completo corregido)

import { useState, useEffect, useRef } from 'react';
import type { MonthlyIrrigationSectorView } from '../../types/irrigation.types';
import type { Sector } from '../../types/farm.types';
import type { CurrentWeather } from '../../types/weather.types';
import IrrigationForm from './IrrigationForm';
import PrecipitationForm from '../precipitation/PrecipitationForm';
import './DailyIrrigationView.css';

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

const MiniWeatherDisplay = ({ isLoading, error, data }: { isLoading: boolean, error: Error | null, data: CurrentWeather | undefined }) => {
    if (isLoading) return <><i className="fas fa-spinner fa-spin"></i> Cargando...</>;
    if (error) return <><i className="fas fa-exclamation-circle" title={error.message}></i> Clima no disponible</>;
    if (data?.main && data.weather?.[0]) {
        const weatherInfo = data.weather[0];
        return (
            <>
                <i className={getWeatherIcon(weatherInfo.main)}></i>
                <strong>{Math.round(data.main.temp)}°C</strong>
                <span className="weather-description">{weatherInfo.description}</span>
            </>
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
    const precipitationMap = new Map<string, any[]>();

    monthlyData.forEach(sectorView => {
        // Llenar mapa de riego
        Object.entries(sectorView.dailyIrrigations).forEach(([day, details]) => {
            irrigationMap.set(`${sectorView.sectorId}-${day}`, details);
        });
        // Llenar mapa de precipitación (si existe)
        if (sectorView.dailyPrecipitations) {
             Object.entries(sectorView.dailyPrecipitations).forEach(([day, details]) => {
                // Usamos solo el día como clave ya que la lluvia es por finca, no por sector específico en este modelo
                precipitationMap.set(String(day), details);
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
                    const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`; // Formato YYYY-MM-DD
                    // Determinar si el día es pasado, presente o futuro
                    let dayClass = date < todayDate ? 'past' : (date.getTime() === todayDate.getTime() ? 'today' : 'future');

                    // Obtener datos de precipitación para el día
                    const dailyPrecipitation = precipitationMap.get(String(day));
                    const totalRain = dailyPrecipitation?.reduce((sum, rec) => sum + (rec?.mmRain || 0), 0) || 0;

                    return (
                        // Contenedor principal de la tarjeta del día
                        <div key={day} className={`day-card ${dayClass}`} ref={dayClass === 'today' ? todayRef : null}>
                            {/* Cabecera de la tarjeta */}
                            <div className="day-card-header">
                                {/* Nombre del día y número */}
                                <span>{date.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric' })}</span>
                                {/* Acciones en la cabecera */}
                                <div className="header-actions">
                                    {/* Mostrar clima solo para el día de hoy */}
                                    {dayClass === 'today' && <MiniWeatherDisplay isLoading={isLoadingWeather} error={weatherError} data={weatherData} />}
                                    {/* Mostrar lluvia si hubo */}
                                    {totalRain > 0 && (
                                        <div className="daily-precipitation-display">
                                            <i className="fas fa-cloud-showers-heavy"></i>
                                            <span>{totalRain.toFixed(1)} mm</span>
                                        </div>
                                    )}
                                    {/* Botón para añadir registro de lluvia */}
                                    <button className="btn-add-precipitation" onClick={() => setPrecipitationModalDate(dateString)}>
                                        <i className="fas fa-cloud-rain"></i> Añadir Lluvia
                                    </button>
                                </div>
                            </div>
                            {/* Lista de sectores para este día */}
                            <div className="sector-list">
                                {sectors.map(sector => {
                                    // Obtener registros de riego para este sector y día
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
                                                    <i className="fas fa-plus"></i> Añadir Riego
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