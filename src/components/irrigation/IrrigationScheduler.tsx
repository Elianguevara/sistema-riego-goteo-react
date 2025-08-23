// Archivo: src/components/irrigation/IrrigationScheduler.tsx

import { useState } from 'react';
import type { MonthlyIrrigationSectorView, DailyIrrigationDetail } from '../../types/irrigation.types';
import IrrigationForm from './IrrigationForm';
import './IrrigationScheduler.css';

interface SchedulerProps {
    farmId: number;
    monthlyData: MonthlyIrrigationSectorView[];
    year: number;
    month: number; // 1-12
}

const IrrigationScheduler = ({ farmId, monthlyData, year, month }: SchedulerProps) => {
    const [modalInfo, setModalInfo] = useState<{ sectorId: number; date: string; record: DailyIrrigationDetail | null } | null>(null);

    const daysInMonth = new Date(year, month, 0).getDate();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const handleCellClick = (sectorId: number, day: number, records: DailyIrrigationDetail[] | undefined) => {
        const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const recordToEdit = records && records.length > 0 ? records[0] : null;
        setModalInfo({ sectorId, date, record: recordToEdit });
    };

    // --- INICIO DE LA MODIFICACIÓN: Manejo de nulos ---
    // 1. Filtramos el array `monthlyData` para asegurarnos de que no contenga elementos nulos
    //    o elementos sin las propiedades esenciales que necesitamos para renderizar una fila.
    const validMonthlyData = monthlyData?.filter(sectorData => 
        sectorData && sectorData.sectorId && sectorData.sectorName && sectorData.dailyIrrigations
    ) || [];
    // --- FIN DE LA MODIFICACIÓN ---

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
                        {/* 2. Ahora usamos el nuevo array `validMonthlyData` que ya está "limpio" */}
                        {validMonthlyData.map(sectorData => (
                            <tr key={sectorData.sectorId}>
                                <td>{sectorData.sectorName}</td>
                                {daysArray.map(day => {
                                    // Usamos optional chaining `?` por si `dailyIrrigations` fuera nulo (aunque ya lo filtramos)
                                    const dailyRecords = sectorData.dailyIrrigations?.[day];
                                    const totalWater = dailyRecords?.reduce((sum, rec) => sum + (rec?.waterAmount || 0), 0);

                                    return (
                                        <td 
                                            key={day} 
                                            onClick={() => handleCellClick(sectorData.sectorId, day, dailyRecords)} 
                                            className={dailyRecords ? 'filled' : 'empty'}
                                        >
                                            {totalWater ? `${totalWater.toFixed(1)} m³` : '+'}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {/* 3. Si después de filtrar no queda nada, mostramos un mensaje útil */}
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
                    existingRecord={null} 
                    onClose={() => setModalInfo(null)}
                />
            )}
        </>
    );
};

export default IrrigationScheduler;