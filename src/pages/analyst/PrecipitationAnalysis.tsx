// Archivo: src/pages/analyst/PrecipitationAnalysis.tsx

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChevronDown, CloudRain, Droplets, Filter, Download, Percent, CalendarDays } from 'lucide-react';
import farmService from '../../services/farmService';
import precipitationService from '../../services/precipitationService';
import type { Farm } from '../../types/farm.types';
import type { PrecipitationRecord, PrecipitationSummary } from '../../types/precipitation.types';
import './PrecipitationAnalysis.css';
import EmptyState from '../../components/ui/EmptyState';

// --- Componente Personalizado para Tooltips ---
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="precipitation-tooltip">
                <p className="tooltip-label">
                    <CalendarDays size={14} /> {new Date(label + 'T00:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                {payload.map((pld: any, index: number) => (
                    <div key={index} style={{ color: pld.color }}>
                        {pld.name}: <strong>{pld.value.toFixed(1)} mm</strong>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

// --- Componente Principal ---
const PrecipitationAnalysis = () => {
    const [selectedFarmId, setSelectedFarmId] = useState<number | undefined>();
    const [showFilters, setShowFilters] = useState(true);

    // --- Queries ---
    const { data: farms = [] } = useQuery<Farm[]>({ queryKey: ['farms'], queryFn: farmService.getFarms });

    useState(() => {
        if (farms.length > 0 && !selectedFarmId) {
            setSelectedFarmId(farms[0].id);
        }
    });
    
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const { data: annualSummary, isLoading: isLoadingAnnual } = useQuery<PrecipitationSummary, Error>({
        queryKey: ['annualPrecipitationSummary', selectedFarmId, currentYear],
        queryFn: () => precipitationService.getAnnualSummary(selectedFarmId!, currentYear),
        enabled: !!selectedFarmId,
    });

    const { data: monthlySummary, isLoading: isLoadingMonthly } = useQuery<PrecipitationSummary, Error>({
        queryKey: ['monthlyPrecipitationSummary', selectedFarmId, currentYear, currentMonth],
        queryFn: () => precipitationService.getMonthlySummary(selectedFarmId!, currentYear, currentMonth),
        enabled: !!selectedFarmId,
    });

    const { data: records = [], isLoading: isLoadingRecords } = useQuery<PrecipitationRecord[], Error>({
        queryKey: ['precipitationHistory', selectedFarmId],
        queryFn: () => precipitationService.getPrecipitationsByFarm(selectedFarmId!),
        enabled: !!selectedFarmId,
    });

    const effectiveness = useMemo(() => {
        if (!annualSummary || annualSummary.totalMmRain === 0) return 0;
        return (annualSummary.totalMmEffectiveRain / annualSummary.totalMmRain) * 100;
    }, [annualSummary]);

    const getEffectivenessBadge = (effectiveness: number) => {
        if (effectiveness >= 85) return 'badge-high';
        if (effectiveness > 0) return 'badge-medium';
        return 'badge-low';
    };

    return (
        <div className="precipitation-analysis-page">
            {/* Header */}
            <header className="analysis-header">
                <div className="analysis-title-group">
                    <h1><CloudRain size={32} color="#3b82f6" /> Análisis de Precipitaciones</h1>
                    <p>Visualización y seguimiento de los registros de lluvia.</p>
                </div>
                <div className="analysis-header-actions">
                    <button onClick={() => setShowFilters(!showFilters)} className="header-btn">
                        <Filter size={18} /> {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
                    </button>
                    <button className="header-btn export-btn"><Download size={18} /> Exportar</button>
                </div>
            </header>

            {/* Panel de Filtros */}
            {showFilters && (
                <div className="filters-panel">
                    <div className="filter-group">
                        <label>🏡 Finca</label>
                        <select onChange={(e) => setSelectedFarmId(Number(e.target.value))} value={selectedFarmId || ''}>
                            <option value="" disabled>Seleccione una finca...</option>
                            {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                        </select>
                    </div>
                </div>
            )}
            
            {selectedFarmId ? (
                <div className="analysis-grid">
                    {/* KPI Cards */}
                    <div className="kpi-card-precip kpi-campaign-total"><Droplets size={24} /><div><span>Total Campaña</span><strong>{annualSummary?.totalMmRain.toFixed(1) ?? 'N/A'} mm</strong></div></div>
                    <div className="kpi-card-precip kpi-campaign-effective"><Droplets size={24} /><div><span>Efectiva Campaña</span><strong>{annualSummary?.totalMmEffectiveRain.toFixed(1) ?? 'N/A'} mm</strong></div></div>
                    <div className="kpi-card-precip kpi-month-total"><CalendarDays size={24} /><div><span>Total Mes Actual</span><strong>{monthlySummary?.totalMmRain.toFixed(1) ?? 'N/A'} mm</strong></div></div>
                    <div className="kpi-card-precip kpi-effectiveness"><Percent size={24} /><div><span>Tasa Efectividad</span><strong>{effectiveness.toFixed(1)}%</strong></div></div>

                    {/* Gráficos */}
                    <div className="chart-card-precip full-width">
                        <h3 className="chart-title">Evolución de Precipitaciones (Últimos 30 días)</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={records.slice(-30)}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                <XAxis dataKey="precipitationDate" tickFormatter={(date) => new Date(date+'T00:00:00').toLocaleDateString('es-AR', {day:'numeric', month:'short'})} />
                                <YAxis />
                                <Tooltip content={<CustomTooltip />} />
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                                    <linearGradient id="colorEffective" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                                </defs>
                                <Area type="monotone" dataKey="mmRain" name="Lluvia Total" stroke="#3b82f6" fillOpacity={1} fill="url(#colorTotal)" />
                                <Area type="monotone" dataKey="mmEffectiveRain" name="Lluvia Efectiva" stroke="#10b981" fillOpacity={1} fill="url(#colorEffective)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Historial de Registros */}
                    <div className="history-card-precip full-width">
                        <h3 className="history-title">Historial de Registros ({records.length})</h3>
                        <div className="table-container">
                            <table className="precipitation-table">
                                <thead><tr><th>Fecha</th><th>Lluvia Total (mm)</th><th>Lluvia Efectiva (mm)</th><th>Efectividad</th></tr></thead>
                                <tbody>
                                    {records.map(r => {
                                        const recordEffectiveness = r.mmRain > 0 ? (r.mmEffectiveRain / r.mmRain) * 100 : 0;
                                        return (
                                            <tr key={r.id}>
                                                <td><CalendarDays size={14} />{new Date(r.precipitationDate + 'T00:00:00').toLocaleDateString('es-AR')}</td>
                                                <td className="rain-total">{r.mmRain.toFixed(2)}</td>
                                                <td className="rain-effective">{r.mmEffectiveRain.toFixed(2)}</td>
                                                <td><span className={`badge ${getEffectivenessBadge(recordEffectiveness)}`}>{recordEffectiveness.toFixed(0)}%</span></td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                <EmptyState
                    icon={<Filter size={24} />}
                    title="Seleccione una finca para comenzar el análisis"
                />
            )}
        </div>
    );
};

export default PrecipitationAnalysis;