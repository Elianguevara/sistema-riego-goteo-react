// Archivo: src/components/irrigation/DailyIrrigationView.tsx

import { useState, useEffect, useRef } from 'react';
import type { MonthlyIrrigationSectorView, DailyIrrigationDetail } from '../../types/irrigation.types';
import type { Sector } from '../../types/farm.types';
import IrrigationForm from './IrrigationForm';
import './DailyIrrigationView.css';

interface DailyViewProps {
    farmId: number;
    sectors: Sector[];
    monthlyData: MonthlyIrrigationSectorView[];
    year: number;
    month: number;
}

const DailyIrrigationView = ({ farmId, sectors, monthlyData, year, month }: DailyViewProps) => {
    const [modalInfo, setModalInfo] = useState<{ sectorId: number; date: string; } | null>(null);
    const todayRef = useRef<HTMLDivElement>(null);

    const daysInMonth = new Date(year, month, 0).getDate();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const handleOpenModal = (sectorId: number, day: number) => {
        const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        setModalInfo({ sectorId, date });
    };

    useEffect(() => {
        setTimeout(() => {
            todayRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }, 100);
    }, []);

    const irrigationMap = new Map<string, DailyIrrigationDetail[]>();
    monthlyData.forEach(sectorView => {
        Object.entries(sectorView.dailyIrrigations).forEach(([day, details]) => {
            const key = `${sectorView.sectorId}-${day}`;
            irrigationMap.set(key, details);
        });
    });

    const now = new Date();
    // Normalizamos 'now' a la medianoche para una comparación de fecha precisa
    const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return (
        <>
            <div className="daily-view-container">
                {daysArray.map(day => {
                    const date = new Date(year, month - 1, day);
                    
                    // --- LÓGICA DE CLASES CORREGIDA Y MEJORADA ---
                    let dayClass = '';
                    if (date < todayDate) {
                        dayClass = 'past';
                    } else if (date.getTime() === todayDate.getTime()) {
                        dayClass = 'today';
                    } else {
                        dayClass = 'future';
                    }
                    // --- FIN DE LA LÓGICA DE CLASES ---
                    
                    return (
                        <div key={day} className={`day-card ${dayClass}`} ref={dayClass === 'today' ? todayRef : null}>
                            <div className="day-card-header">
                                <span>{date.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                                {dayClass === 'today' && <span className="today-badge">HOY</span>}
                            </div>
                            <div className="sector-list">
                                {sectors.map(sector => {
                                    const recordKey = `${sector.id}-${day}`;
                                    const dailyRecords = irrigationMap.get(recordKey);
                                    const totalWater = dailyRecords?.reduce((sum, rec) => sum + (rec?.waterAmount || 0), 0) || 0;
                                    const totalHours = dailyRecords?.reduce((sum, rec) => sum + (rec?.irrigationHours || 0), 0) || 0;

                                    return (
                                        <div key={sector.id} className="sector-row">
                                            <span className="sector-name">{sector.name}</span>
                                            {totalWater > 0 ? (
                                                <div className="irrigation-data">
                                                    <span className="water-amount" title="Volumen de agua">{totalWater.toFixed(1)} m³</span>
                                                    <span className="hours" title="Horas de riego">({totalHours.toFixed(1)} hs)</span>
                                                    <button className="btn-view" onClick={() => handleOpenModal(sector.id, day)}>
                                                        Ver/Editar
                                                    </button>
                                                </div>
                                            ) : (
                                                <button className="btn-add-irrigation" onClick={() => handleOpenModal(sector.id, day)}>
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

            {modalInfo && (
                <IrrigationForm
                    farmId={farmId}
                    sectorId={modalInfo.sectorId}
                    date={modalInfo.date}
                    onClose={() => setModalInfo(null)}
                />
            )}
        </>
    );
};

export default DailyIrrigationView;