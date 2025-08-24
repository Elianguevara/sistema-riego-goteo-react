// Archivo: src/components/irrigation/DailyIrrigationView.tsx

import { useState, useEffect, useRef } from 'react';
import type { MonthlyIrrigationSectorView } from '../../types/irrigation.types';
import type { Sector } from '../../types/farm.types';
import IrrigationForm from './IrrigationForm';
// --- RUTA CORREGIDA ---
// Asegúrate de que el archivo PrecipitationForm.tsx exista en la carpeta src/components/precipitation/
import PrecipitationForm from '../precipitation/PrecipitationForm';
import './DailyIrrigationView.css';

interface DailyViewProps {
    farmId: number;
    sectors: Sector[];
    monthlyData: MonthlyIrrigationSectorView[];
    year: number;
    month: number;
}

const DailyIrrigationView = ({ farmId, sectors, monthlyData, year, month }: DailyViewProps) => {
    const [irrigationModal, setIrrigationModal] = useState<{ sectorId: number; date: string; } | null>(null);
    const [precipitationModalDate, setPrecipitationModalDate] = useState<string | null>(null);
    const todayRef = useRef<HTMLDivElement>(null);

    const daysInMonth = new Date(year, month, 0).getDate();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    useEffect(() => {
        setTimeout(() => {
            todayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    }, []);

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
                                {/* --- INICIO DE LA MODIFICACIÓN --- */}
                                <div className="header-actions">
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
                                {/* --- FIN DE LA MODIFICACIÓN --- */}
                            </div>
                            
                            <div className="sector-list">
                                {sectors.map(sector => {
                                    const dailyRecords = irrigationMap.get(`${sector.id}-${day}`);
                                    const totalWater = dailyRecords?.reduce((sum, rec) => sum + (rec?.waterAmount || 0), 0) || 0;
                                    const totalHours = dailyRecords?.reduce((sum, rec) => sum + (rec?.irrigationHours || 0), 0) || 0;

                                    return (
                                        <div key={sector.id} className="sector-row">
                                            <span className="sector-name">{sector.name}</span>
                                            {totalWater > 0 ? (
                                                <div className="irrigation-data">
                                                    <span className="water-amount">{totalWater.toFixed(1)} m³</span>
                                                    <span className="hours">({totalHours.toFixed(1)} hs)</span>
                                                    <button className="btn-view" onClick={() => setIrrigationModal({ sectorId: sector.id, date: dateString })}>
                                                        Ver/Editar
                                                    </button>
                                                </div>
                                            ) : (
                                                <button className="btn-add-irrigation" onClick={() => setIrrigationModal({ sectorId: sector.id, date: dateString })}>
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