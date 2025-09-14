// Archivo: src/pages/analyst/PrecipitationAnalysis.tsx

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import farmService from '../../services/farmService';
import precipitationService from '../../services/precipitationService';
import type { Farm } from '../../types/farm.types';
import type { PrecipitationRecord, PrecipitationSummary } from '../../types/precipitation.types';
import '../operator/RegisterIrrigation.css'; // Reutilizamos estilos
import './PrecipitationAnalysis.css'; // Creamos estilos específicos

// Componente para mostrar el historial
const PrecipitationHistory = ({ farmId }: { farmId: number }) => {
    const { data: records = [], isLoading } = useQuery<PrecipitationRecord[], Error>({
        queryKey: ['precipitationHistory', farmId],
        queryFn: () => precipitationService.getPrecipitationsByFarm(farmId),
    });

    if (isLoading) return <p>Cargando historial...</p>;

    return (
        <div className="analysis-card">
            <h3>Historial de Registros</h3>
            {records.length > 0 ? (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Lluvia (mm)</th>
                                <th>Lluvia Efectiva (mm)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map(r => (
                                <tr key={r.id}>
                                    <td>{new Date(r.precipitationDate + 'T00:00:00').toLocaleDateString()}</td>
                                    <td>{r.mmRain.toFixed(2)}</td>
                                    <td>{r.mmEffectiveRain.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : <p>No hay registros para esta finca.</p>}
        </div>
    );
};

// Componente para mostrar los resúmenes
const PrecipitationSummaries = ({ farmId }: { farmId: number }) => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const { data: annual, isLoading: isLoadingAnnual } = useQuery<PrecipitationSummary, Error>({
        queryKey: ['annualSummary', farmId, currentYear],
        queryFn: () => precipitationService.getAnnualSummary(farmId, currentYear),
    });

    const { data: monthly, isLoading: isLoadingMonthly } = useQuery<PrecipitationSummary, Error>({
        queryKey: ['monthlySummary', farmId, currentYear, currentMonth],
        queryFn: () => precipitationService.getMonthlySummary(farmId, currentYear, currentMonth),
    });

    return (
        <div className="summary-cards-container">
            <div className="summary-card">
                <h4>Resumen Campaña Actual ({currentYear}-{currentYear + 1})</h4>
                {isLoadingAnnual ? <p>Cargando...</p> : (
                    <>
                        <div className="summary-value">{annual?.totalMmRain.toFixed(1) ?? 'N/A'} mm</div>
                        <div className="summary-label">Total Lluvia</div>
                        <div className="summary-value effective">{annual?.totalMmEffectiveRain.toFixed(1) ?? 'N/A'} mm</div>
                        <div className="summary-label">Total Lluvia Efectiva</div>
                    </>
                )}
            </div>
             <div className="summary-card">
                <h4>Resumen Mes Actual</h4>
                 {isLoadingMonthly ? <p>Cargando...</p> : (
                    <>
                        <div className="summary-value">{monthly?.totalMmRain.toFixed(1) ?? 'N/A'} mm</div>
                        <div className="summary-label">Total Lluvia</div>
                        <div className="summary-value effective">{monthly?.totalMmEffectiveRain.toFixed(1) ?? 'N/A'} mm</div>
                        <div className="summary-label">Total Lluvia Efectiva</div>
                    </>
                )}
            </div>
        </div>
    );
}

const PrecipitationAnalysis = () => {
    const [selectedFarmId, setSelectedFarmId] = useState<number | undefined>();
    const { data: farms = [] } = useQuery<Farm[]>({ queryKey: ['farms'], queryFn: farmService.getFarms });

    useEffect(() => {
        if (selectedFarmId || farms.length === 0) return;
        setSelectedFarmId(farms[0].id);
    }, [farms, selectedFarmId]);

    return (
        <div className="register-irrigation-page">
            <h1>Análisis de Precipitaciones</h1>
            <div className="filters-bar">
                <select onChange={(e) => setSelectedFarmId(Number(e.target.value))} value={selectedFarmId || ''}>
                    <option value="">Seleccione una Finca...</option>
                    {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
            </div>

            {selectedFarmId ? (
                <div className="analysis-layout">
                    <PrecipitationSummaries farmId={selectedFarmId} />
                    <PrecipitationHistory farmId={selectedFarmId} />
                </div>
            ) : (
                 <div className="empty-state" style={{marginTop: '20px'}}>
                    <p>Por favor, seleccione una finca para ver el análisis.</p>
                </div>
            )}
        </div>
    );
};

export default PrecipitationAnalysis;