import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Droplets, Clock, TrendingUp, Filter, Download } from 'lucide-react';
import farmService from '../../services/farmService';
import analyticsService from '../../services/analyticsService';
import type { Farm, Sector } from '../../types/farm.types';
import './IrrigationAnalysis.css';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

// Componente Personalizado para Tooltips de Gráficos
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="tooltip-custom">
                <p className="tooltip-label">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} className="tooltip-item" style={{ color: entry.color }}>
                        {entry.name}: <strong>{entry.value.toLocaleString(undefined, { maximumFractionDigits: 1 })}</strong>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};


const IrrigationAnalysis = () => {
    const today = new Date();
    const thirtyDaysAgo = new Date(new Date().setDate(today.getDate() - 30));

    // Estados para los filtros
    const [selectedFarmId, setSelectedFarmId] = useState<number | undefined>();
    const [selectedSectorIds, setSelectedSectorIds] = useState<string[]>([]);
    const [dateRange, setDateRange] = useState({
        start: thirtyDaysAgo.toISOString().split('T')[0],
        end: today.toISOString().split('T')[0],
    });
    const [showFilters, setShowFilters] = useState(true);

    // Queries para obtener datos del backend
    const { data: farms = [] } = useQuery<Farm[]>({ queryKey: ['farms'], queryFn: farmService.getFarms });
    const { data: sectors = [] } = useQuery<Sector[]>({
        queryKey: ['sectors', selectedFarmId],
        queryFn: () => farmService.getSectorsByFarm(selectedFarmId!),
        enabled: !!selectedFarmId,
    });
    
    const { data: summaryData = [], isLoading: isLoadingSummary } = useQuery({
        queryKey: ['irrigationSummary', selectedFarmId, dateRange, selectedSectorIds],
        queryFn: () => analyticsService.getIrrigationSummary({
            farmId: selectedFarmId!,
            startDate: dateRange.start,
            endDate: dateRange.end,
            sectorIds: selectedSectorIds.join(','),
        }),
        enabled: !!selectedFarmId,
    });

    const { data: timeseriesData, isLoading: isLoadingTimeseries } = useQuery({
        queryKey: ['irrigationTimeseries', selectedSectorIds, dateRange],
        queryFn: () => analyticsService.getIrrigationTimeseries({
            sectorId: Number(selectedSectorIds[0]),
            startDate: dateRange.start,
            endDate: dateRange.end,
        }),
        enabled: selectedSectorIds.length === 1,
    });

    // Manejadores de eventos para los filtros
    const handleFarmChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedFarmId(Number(e.target.value));
        setSelectedSectorIds([]);
    };

    const handleSectorToggle = (sectorId: string) => {
        setSelectedSectorIds(prev => 
            prev.includes(sectorId) 
                ? prev.filter(id => id !== sectorId)
                : [...prev, sectorId]
        );
    };

    // Cálculos para las tarjetas KPI
    const totalWater = summaryData.reduce((sum, item) => sum + item.totalWaterAmount, 0);
    const totalHours = summaryData.reduce((sum, item) => sum + item.totalIrrigationHours, 0);
    
    return (
        <div className="analysis-page">
            {/* Header */}
            <header className="analysis-header">
                <div className="analysis-title-group">
                    <h1>
                        <Droplets size={32} color="#3b82f6" />
                        Análisis de Riego
                    </h1>
                    <p>Monitoreo y análisis del consumo de agua por sectores</p>
                </div>
                <div className="analysis-header-actions">
                    <button onClick={() => setShowFilters(!showFilters)} className="header-btn">
                        <Filter size={18} />
                        {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
                    </button>
                    <button className="header-btn export-btn">
                        <Download size={18} />
                        Exportar
                    </button>
                </div>
            </header>

            {/* Panel de Filtros */}
            {showFilters && (
                <div className="filters-panel">
                    <div className="filters-grid">
                        <div className="filter-group">
                            <label>🏡 Finca</label>
                            <select onChange={handleFarmChange} value={selectedFarmId || ''}>
                                <option value="" disabled>Seleccione una finca...</option>
                                {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>📍 Sectores</label>
                            <div className="sectors-filter">
                                {!selectedFarmId ? (
                                    <p>Seleccione una finca primero</p>
                                ) : (
                                    sectors.map(s => (
                                        <label key={s.id} className="sector-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={selectedSectorIds.includes(String(s.id))}
                                                onChange={() => handleSectorToggle(String(s.id))}
                                            />
                                            {s.name}
                                        </label>
                                    ))
                                )}
                            </div>
                        </div>
                        <div className="filter-group">
                            <label>📅 Fecha de Inicio</label>
                            <input type="date" value={dateRange.start} onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))} />
                        </div>
                        <div className="filter-group">
                            <label>📅 Fecha de Fin</label>
                            <input type="date" value={dateRange.end} onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))} />
                        </div>
                    </div>
                </div>
            )}

            {/* Contenido principal: KPIs y Gráficos */}
            {selectedFarmId ? (
                <>
                    {/* Tarjetas KPI */}
                    <div className="kpi-grid">
                        <div className="kpi-card kpi-card-water">
                            <div>
                                <p className="kpi-label">Consumo Total de Agua</p>
                                <h2 className="kpi-value">{totalWater.toLocaleString()}</h2>
                                <p className="kpi-unit water">m³</p>
                            </div>
                            <div className="kpi-card-icon water"><Droplets size={24} color="#3b82f6" /></div>
                        </div>
                        <div className="kpi-card kpi-card-hours">
                            <div>
                                <p className="kpi-label">Total de Horas de Riego</p>
                                <h2 className="kpi-value">{totalHours.toFixed(1)}</h2>
                                <p className="kpi-unit hours">horas</p>
                            </div>
                            <div className="kpi-card-icon hours"><Clock size={24} color="#10b981" /></div>
                        </div>
                    </div>

                    {/* Gráficos */}
                    <div className="charts-grid">
                        <div className="chart-card">
                            <h3 className="chart-title">
                                <span className="chart-title-bar" style={{backgroundColor: '#3b82f6'}} />
                                Consumo de Agua por Sector
                            </h3>
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={summaryData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                    <XAxis dataKey="sectorName" tick={{ fill: '#6b7280', fontSize: 12 }} />
                                    <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="totalWaterAmount" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Agua (m³)" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="chart-card">
                            <h3 className="chart-title">
                                <span className="chart-title-bar" style={{backgroundColor: '#10b981'}} />
                                Horas de Riego por Sector
                            </h3>
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={summaryData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                    <XAxis dataKey="sectorName" tick={{ fill: '#6b7280', fontSize: 12 }} />
                                    <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="totalIrrigationHours" fill="#10b981" radius={[8, 8, 0, 0]} name="Horas" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {selectedSectorIds.length === 1 && (
                         <div className="chart-card">
                            <h3 className="chart-title">
                                 <span className="chart-title-bar" style={{backgroundColor: '#ec4899'}} />
                                 Evolución Diaria - {sectors.find(s => s.id === Number(selectedSectorIds[0]))?.name}
                            </h3>
                            <ResponsiveContainer width="100%" height={280}>
                                <LineChart data={timeseriesData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                    <XAxis dataKey="date" tickFormatter={(date) => new Date(date+'T00:00:00').toLocaleDateString('es-AR', {day:'numeric', month:'short'})} tick={{ fill: '#6b7280', fontSize: 12 }} />
                                    <YAxis yAxisId="left" tick={{ fill: '#6b7280', fontSize: 12 }} />
                                    <YAxis yAxisId="right" orientation="right" tick={{ fill: '#6b7280', fontSize: 12 }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Line yAxisId="left" type="monotone" dataKey="waterAmount" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Agua (m³)" />
                                    <Line yAxisId="right" type="monotone" dataKey="irrigationHours" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} name="Horas" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                </>
            ) : (
                <div className="empty-state">
                    <Droplets size={48} color="#9ca3af" />
                    <h3>Seleccione una finca para comenzar</h3>
                    <p>Use los filtros superiores para seleccionar una finca y visualizar los datos de riego.</p>
                </div>
            )}
            
            <style>{`@keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
    );
};

export default IrrigationAnalysis;
