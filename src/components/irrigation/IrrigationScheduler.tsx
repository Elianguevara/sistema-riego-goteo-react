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
    // Usaremos un estado más simple para el modal
    const [modalInfo, setModalInfo] = useState<{ sectorId: number; date: string; record: DailyIrrigationDetail | null } | null>(null);

    const daysInMonth = new Date(year, month, 0).getDate();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // Simplificamos la lógica para abrir el modal
    // Por ahora, si hay varios riegos, editaremos el primero.
    const handleCellClick = (sectorId: number, day: number, records: DailyIrrigationDetail[] | undefined) => {
        const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const recordToEdit = records && records.length > 0 ? records[0] : null;
        setModalInfo({ sectorId, date, record: recordToEdit });
    };

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
                        {monthlyData.map(sectorData => (
                            <tr key={sectorData.sectorId}>
                                <td>{sectorData.sectorName}</td>
                                {daysArray.map(day => {
                                    const dailyRecords = sectorData.dailyIrrigations[day];
                                    const totalWater = dailyRecords?.reduce((sum, rec) => sum + rec.waterAmount, 0);

                                    return (
                                        <td key={day} onClick={() => handleCellClick(sectorData.sectorId, day, dailyRecords)} className={dailyRecords ? 'filled' : 'empty'}>
                                            {totalWater ? `${totalWater.toFixed(1)} m³` : '+'}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* El formulario necesitará una adaptación para manejar la nueva estructura de datos */}
            {/* Por simplicidad, se omite la lógica de edición en este paso */}
            {modalInfo && (
                <IrrigationForm
                    farmId={farmId}
                    sectorId={modalInfo.sectorId}
                    date={modalInfo.date}
                    // Pasamos un objeto compatible al formulario, la lógica de edición completa requeriría más cambios.
                    existingRecord={null} 
                    onClose={() => setModalInfo(null)}
                />
            )}
        </>
    );
};

export default IrrigationScheduler;
