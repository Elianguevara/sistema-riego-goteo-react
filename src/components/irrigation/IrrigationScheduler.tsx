// Archivo: src/components/irrigation/IrrigationScheduler.tsx

import { useState } from 'react';
import type { MonthlyIrrigationSectorView } from '../../types/irrigation.types';
import type { Sector } from '../../types/farm.types'; // Importamos el tipo Sector
import IrrigationForm from './IrrigationForm';
import './IrrigationScheduler.css';

interface SchedulerProps {
    farmId: number;
    monthlyData: MonthlyIrrigationSectorView[];
    year: number;
    month: number;
}

const IrrigationScheduler = ({ farmId, monthlyData, year, month }: SchedulerProps) => {
    // --- LÓGICA CORREGIDA: El estado ahora almacena el objeto Sector completo ---
    const [modalInfo, setModalInfo] = useState<{ sector: Sector; date: string; } | null>(null);

    const daysInMonth = new Date(year, month, 0).getDate();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const handleCellClick = (sectorId: number, day: number) => {
        const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        // Buscamos la información del sector en los datos que ya tenemos
        const sectorData = validMonthlyData.find(s => s.sectorId === sectorId);
        if (!sectorData) return; // Si no lo encuentra, no hacemos nada

        // Construimos el objeto Sector que el formulario necesita
        const sectorForForm: Sector = {
            id: sectorData.sectorId,
            name: sectorData.sectorName,
            farmId: farmId,
            farmName: '', // No es crucial para el formulario
        };

        setModalInfo({ sector: sectorForForm, date });
    };

    const validMonthlyData = monthlyData?.filter(sectorData =>
        sectorData && sectorData.sectorId && sectorData.sectorName && sectorData.dailyIrrigations
    ) || [];

    const now = new Date();
    const today = now.getDate();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    return (
        <>
            <div className="scheduler-container">
                <table className="scheduler-table">
                    <thead>
                        <tr>
                            <th>Sector</th>
                            {daysArray.map(day => <th key={day}>{day}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {validMonthlyData.map(sectorData => (
                            <tr key={sectorData.sectorId}>
                                <td>{sectorData.sectorName}</td>
                                {daysArray.map(day => {
                                    const dailyIrrigations = sectorData.dailyIrrigations?.[day];
                                    const dailyPrecipitations = sectorData.dailyPrecipitations?.[day];
                                    
                                    const totalWater = dailyIrrigations?.reduce((sum, rec) => sum + (rec?.waterAmount || 0), 0) || 0;
                                    const totalRain = dailyPrecipitations?.reduce((sum, rec) => sum + (rec?.mmRain || 0), 0) || 0;

                                    const isToday = day === today && month === currentMonth && year === currentYear;

                                    let intensityClass = '';
                                    if (totalWater > 0) intensityClass = 'intensity-1';
                                    if (totalWater > 50) intensityClass = 'intensity-2';
                                    if (totalWater > 100) intensityClass = 'intensity-3';

                                    const cellClassName = `day-cell ${totalWater > 0 ? 'filled' : 'empty'} ${isToday ? 'today' : ''} ${intensityClass}`.trim();

                                    return (
                                        <td key={day} onClick={() => handleCellClick(sectorData.sectorId, day)}>
                                            <div className={cellClassName}>
                                                <div className="cell-header">
                                                    {totalRain > 0 && (
                                                        <span className="precipitation-badge">
                                                            <i className="fas fa-cloud-rain"></i> {totalRain.toFixed(1)} mm
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="irrigation-details">
                                                    {totalWater > 0 ? (
                                                        <span className="irrigation-amount">
                                                            <i className="fas fa-tint irrigation-icon"></i>
                                                            {totalWater.toFixed(1)}
                                                        </span>
                                                    ) : (
                                                        <i className="fas fa-plus"></i>
                                                    )}
                                                </div>
                                                
                                                <div></div> 
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {validMonthlyData.length === 0 && (
                    <div className="empty-state" style={{marginTop: '20px'}}>
                        <p>No se encontraron sectores con datos de riego para esta finca.</p>
                    </div>
                )}
            </div>
            
            {modalInfo && (
                // --- LLAMADA AL COMPONENTE CORREGIDA ---
                <IrrigationForm
                    farmId={farmId}
                    sector={modalInfo.sector} // Pasamos el objeto 'sector' completo
                    date={modalInfo.date}
                    onClose={() => setModalInfo(null)}
                />
            )}
        </>
    );
};

export default IrrigationScheduler;
