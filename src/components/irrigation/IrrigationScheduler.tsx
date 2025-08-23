// Archivo: src/components/irrigation/IrrigationScheduler.tsx

import { useState } from 'react';
// CORRECCIÓN: Se elimina 'DailyIrrigationDetail' de la importación porque ya no se usa aquí.
import type { MonthlyIrrigationSectorView } from '../../types/irrigation.types';
import IrrigationForm from './IrrigationForm';
import './IrrigationScheduler.css';

interface SchedulerProps {
    farmId: number;
    monthlyData: MonthlyIrrigationSectorView[];
    year: number;
    month: number; // 1-12
}

const IrrigationScheduler = ({ farmId, monthlyData, year, month }: SchedulerProps) => {
    // El resto del código permanece exactamente igual...
    const [modalInfo, setModalInfo] = useState<{ sectorId: number; date: string; } | null>(null);

    const daysInMonth = new Date(year, month, 0).getDate();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const handleCellClick = (sectorId: number, day: number) => {
        const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        setModalInfo({ sectorId, date });
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
                            {daysArray.map(day => {
                                const isToday = day === today && month === currentMonth && year === currentYear;
                                return <th key={day} className={isToday ? 'today' : ''}>{day}</th>;
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {validMonthlyData.map(sectorData => (
                            <tr key={sectorData.sectorId}>
                                <td>{sectorData.sectorName}</td>
                                {daysArray.map(day => {
                                    const dailyRecords = sectorData.dailyIrrigations?.[day];
                                    const totalWater = dailyRecords?.reduce((sum, rec) => sum + (rec?.waterAmount || 0), 0) || 0;
                                    const isToday = day === today && month === currentMonth && year === currentYear;

                                    let intensityClass = '';
                                    if (totalWater > 0) intensityClass = 'intensity-1';
                                    if (totalWater > 50) intensityClass = 'intensity-2';
                                    if (totalWater > 100) intensityClass = 'intensity-3';

                                    const cellClassName = `
                                        ${totalWater > 0 ? 'filled' : 'empty'}
                                        ${isToday ? 'today' : ''}
                                        ${intensityClass}
                                    `.trim();

                                    return (
                                        <td
                                            key={day}
                                            onClick={() => handleCellClick(sectorData.sectorId, day)}
                                            className={cellClassName}
                                        >
                                            {totalWater > 0 ? `${totalWater.toFixed(1)} m³` : '+'}
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

export default IrrigationScheduler;