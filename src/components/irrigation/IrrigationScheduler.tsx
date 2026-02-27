// Archivo: src/components/irrigation/IrrigationScheduler.tsx

import { useState, useEffect, useRef } from 'react';
import type { MonthlyIrrigationSectorView } from '../../types/irrigation.types';
import type { Sector } from '../../types/farm.types';
import IrrigationForm from './IrrigationForm';
import './IrrigationScheduler.css';
import EmptyState from '../ui/EmptyState';
import { CloudRain, Clock, Plus } from 'lucide-react';

interface SchedulerProps {
    farmId: number;
    monthlyData: MonthlyIrrigationSectorView[];
    year: number;
    month: number;
}

const IrrigationScheduler = ({ farmId, monthlyData, year, month }: SchedulerProps) => {
    const [modalInfo, setModalInfo] = useState<{ sector: Sector; date: string; } | null>(null);
    const todayRef = useRef<HTMLTableCellElement>(null);

    // Auto-scroll al día actual cuando cambia el mes
    useEffect(() => {
        setTimeout(() => {
            todayRef.current?.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'nearest',
                inline: 'center'
            });
        }, 200);
    }, [month, year]);

    const daysInMonth = new Date(year, month, 0).getDate();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const handleCellClick = (sectorId: number, day: number) => {
        const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        const sectorData = validMonthlyData.find(s => s.sectorId === sectorId);
        if (!sectorData) return;

        const sectorForForm: Sector = {
            id: sectorData.sectorId,
            name: sectorData.sectorName,
            farmId: farmId,
            farmName: '',
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
    const todayDate = new Date(currentYear, currentMonth - 1, today);

    return (
        <>
            <div className="scheduler-container">
                <table className="scheduler-table">
                    <thead>
                        <tr>
                            <th>Sector</th>
                            {daysArray.map(day => {
                                const date = new Date(year, month - 1, day);
                                const isToday = date.getTime() === todayDate.getTime();
                                return (
                                    <th key={day} className={isToday ? 'today-header' : ''}>
                                        {day}
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {validMonthlyData.map((sectorData, rowIndex) => (
                            <tr key={sectorData.sectorId}>
                                <td>{sectorData.sectorName}</td>
                                {daysArray.map(day => {
                                    const dailyIrrigations = sectorData.dailyIrrigations?.[day];
                                    const dailyPrecipitations = sectorData.dailyPrecipitations?.[day];
                                    
                                    const totalHours = dailyIrrigations?.reduce((sum, rec) => sum + (rec?.irrigationHours || 0), 0) || 0;
                                    const totalRain = dailyPrecipitations || 0;

                                    const date = new Date(year, month - 1, day);
                                    const dayClass = date < todayDate ? 'past' : (date.getTime() === todayDate.getTime() ? 'today' : 'future');

                                    let intensityClass = '';
                                    if (totalHours > 0) intensityClass = 'intensity-1';
                                    if (totalHours > 2) intensityClass = 'intensity-2';
                                    if (totalHours > 4) intensityClass = 'intensity-3';

                                    const cellClassName = `day-cell ${totalHours > 0 ? 'filled' : 'empty'} ${dayClass} ${intensityClass}`.trim();

                                    return (
                                        <td 
                                            key={day} 
                                            onClick={() => handleCellClick(sectorData.sectorId, day)}
                                            ref={dayClass === 'today' && rowIndex === 0 ? todayRef : null}
                                        >
                                            <div className={cellClassName}>
                                                <div className="cell-header">
                                                    {totalRain > 0 && (
                                                        <span className="precipitation-badge">
                                                            <CloudRain size={12} /> {totalRain.toFixed(1)} mm
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="irrigation-details">
                                                    {totalHours > 0 ? (
                                                        <span className="irrigation-time">
                                                          <Clock size={12} />
                                                          {totalHours.toFixed(1)} hs
                                                        </span>
                                                    ) : (
                                                        <Plus size={14} />
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
                    <EmptyState
                        title="Sin datos de riego"
                        subtitle="No se encontraron sectores con datos de riego para esta finca."
                    />
                )}
            </div>
            
            {modalInfo && (
                <IrrigationForm
                    farmId={farmId}
                    sector={modalInfo.sector}
                    date={modalInfo.date}
                    onClose={() => setModalInfo(null)}
                />
            )}
        </>
    );
};

export default IrrigationScheduler;