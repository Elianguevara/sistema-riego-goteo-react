// Archivo: src/pages/analyst/Reports.tsx

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

// Services
import farmService from '../../services/farmService';
import reportService from '../../services/reportService';

// Hooks
import { useAsyncReport } from '../../hooks/useAsyncReport';

// Types
import type { Farm, Sector } from '../../types/farm.types';
import type { UserResponse } from '../../types/user.types';

// Icons
import { FileDown, Loader, Calendar, Building2, Filter, Download, BarChart3, FileText, Table } from 'lucide-react';

// Styles
import './Reports.css';

const Reports = () => {
    const today = new Date().toISOString().split('T')[0];
    const [reportType, setReportType] = useState('WATER_BALANCE');
    const [farmId, setFarmId] = useState<string>('');
    const [sectorIds, setSectorIds] = useState<string[]>([]);
    const [operationType, setOperationType] = useState('');
    const [userId, setUserId] = useState('');
    const [format, setFormat] = useState('PDF');
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [isDownloadingCorporate, setIsDownloadingCorporate] = useState(false);

    const { generateReport, isGenerating } = useAsyncReport();

    // --- Queries para obtener datos reales ---
    const { data: farms = [] } = useQuery<Farm[], Error>({
        queryKey: ['farms'],
        queryFn: farmService.getFarms
    });

    const { data: sectors = [] } = useQuery<Sector[], Error>({
        queryKey: ['sectors', farmId],
        queryFn: () => farmService.getSectorsByFarm(Number(farmId)),
        enabled: !!farmId,
    });

    const { data: users = [] } = useQuery<UserResponse[], Error>({
        queryKey: ['assignedUsersForReport', farmId],
        queryFn: () => farmService.getAssignedUsers(Number(farmId)),
        enabled: !!farmId && reportType === 'OPERATIONS_LOG',
    });

    const reportTypes = [
        { value: 'WATER_BALANCE', label: 'Balance Hídrico', icon: <BarChart3 className="icon-class" />, description: 'Análisis detallado del consumo y distribución de agua', color: 'from-blue-500 to-cyan-500' },
        { value: 'OPERATIONS_LOG', label: 'Bitácora de Operaciones', icon: <FileText className="icon-class" />, description: 'Registro completo de actividades y operaciones realizadas', color: 'from-purple-500 to-pink-500' },
        { value: 'PERIOD_SUMMARY', label: 'Resumen del Período', icon: <Table className="icon-class" />, description: 'Vista consolidada de métricas y resultados del período', color: 'from-emerald-500 to-teal-500' }
    ];

    const handleSectorToggle = (sectorId: string) => {
        setSectorIds(prev =>
            prev.includes(sectorId)
                ? prev.filter(id => id !== sectorId)
                : [...prev, sectorId]
        );
    };

    const handleDownloadCorporateReport = async () => {
        setIsDownloadingCorporate(true);
        try {
            await reportService.downloadCorporateReport();
        } catch (error: Error | unknown) {
            const err = error as Error;
            toast.error(`No se pudo descargar el reporte corporativo: ${err.message}`);
        } finally {
            setIsDownloadingCorporate(false);
        }
    };

    const handleGenerateReport = async () => {
        if (!farmId) {
            toast.error('Por favor, seleccione una finca.');
            return;
        }

        const params = new URLSearchParams({
            reportType,
            farmId: farmId,
            startDate,
            endDate,
            format,
        });

        if (reportType === 'WATER_BALANCE' && sectorIds.length > 0) {
            params.append('sectorIds', sectorIds.join(','));
        }
        if (reportType === 'OPERATIONS_LOG') {
            if (operationType) params.append('operationType', operationType);
            if (userId) params.append('userId', userId);
        }

        await generateReport(params);
    };

    const selectedReport = reportTypes.find(r => r.value === reportType)!;

    return (
        <div className="reports-improved-page">
            <div className="header-section">
                <div className="header-title-group">
                    <div className="header-icon-wrapper">
                        <FileDown className="header-icon" />
                    </div>
                    <div>
                        <h1 className="header-title">Generación de Reportes</h1>
                        <p className="header-subtitle">Análisis y reportería avanzada de datos</p>
                    </div>
                </div>
            </div>

            <div className="content-section">
                {/* Tarjeta de descarga rápida del reporte corporativo */}
                <div className="corporate-report-card">
                    <div className="corporate-report-info">
                        <div className="corporate-report-icon-wrapper">
                            <FileDown className="corporate-report-icon" />
                        </div>
                        <div>
                            <h2 className="corporate-report-title">Reporte Corporativo</h2>
                            <p className="corporate-report-description">
                                Documento PDF completo con el resumen ejecutivo del sistema de riego.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleDownloadCorporateReport}
                        disabled={isDownloadingCorporate}
                        className="corporate-download-button"
                    >
                        {isDownloadingCorporate ? (
                            <><Loader className="button-icon animate-spin" /> Descargando...</>
                        ) : (
                            <><Download className="button-icon" /> Descargar PDF</>
                        )}
                    </button>
                </div>

                <div className="report-type-selection">
                    <label className="section-label">
                        Seleccione el tipo de reporte
                    </label>
                    <div className="report-type-grid">
                        {reportTypes.map((type) => (
                            <button
                                key={type.value}
                                onClick={() => setReportType(type.value)}
                                className={`report-type-card ${reportType === type.value ? 'active' : ''}`}
                            >
                                <div className={`report-type-icon ${type.color}`}>
                                    {type.icon}
                                </div>
                                <h3 className="report-type-label">{type.label}</h3>
                                <p className="report-type-description">{type.description}</p>
                                {reportType === type.value && (
                                    <div className="active-indicator">
                                        <svg className="active-indicator-icon" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="main-form">
                    <div className={`form-header ${selectedReport.color}`}>
                        <div className="form-header-content">
                            {selectedReport.icon}
                            <div>
                                <h2 className="form-title">{selectedReport.label}</h2>
                                <p className="form-subtitle">{selectedReport.description}</p>
                            </div>
                        </div>
                    </div>

                    <div className="form-body">
                        <div>
                            <div className="form-section-header">
                                <Filter className="form-section-icon" />
                                <h3 className="form-section-title">Configuración Básica</h3>
                            </div>
                            <div className="basic-config-grid">
                                <div>
                                    <label className="input-label">
                                        <Building2 className="input-icon" /> Finca
                                    </label>
                                    <select value={farmId} onChange={e => setFarmId(e.target.value)} className="select-input">
                                        <option value="">Seleccione una finca...</option>
                                        {farms.map(farm => <option key={farm.id} value={farm.id}>{farm.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="input-label">
                                        <Calendar className="input-icon" /> Fecha de Inicio
                                    </label>
                                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="date-input" />
                                </div>
                                <div>
                                    <label className="input-label">
                                        <Calendar className="input-icon" /> Fecha de Fin
                                    </label>
                                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="date-input" />
                                </div>
                                <div>
                                    <label className="input-label">
                                        <Download className="input-icon" /> Formato de Salida
                                    </label>
                                    <select value={format} onChange={e => setFormat(e.target.value)} className="select-input">
                                        <option value="PDF">PDF - Documento</option>
                                        <option value="CSV">CSV - Datos Simples</option>
                                        <option value="XLSX">Excel - Análisis Avanzado</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {reportType === 'WATER_BALANCE' && (
                            <div className="conditional-section">
                                <label className="input-label">Sectores a Incluir <span className="label-hint">(opcional - sin selección incluye todos)</span></label>
                                <div className="sectors-grid">
                                    {sectors.map(sector => (
                                        <label key={sector.id} className={`sector-checkbox ${sectorIds.includes(String(sector.id)) ? 'active' : ''}`}>
                                            <input type="checkbox" checked={sectorIds.includes(String(sector.id))} onChange={() => handleSectorToggle(String(sector.id))} className="checkbox-input" />
                                            <span className="checkbox-label">{sector.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {reportType === 'OPERATIONS_LOG' && (
                            <div className="conditional-section">
                                <h3 className="input-label">Filtros Adicionales</h3>
                                <div className="operations-log-grid">
                                    <div>
                                        <label className="input-label">Tipo de Operación <span className="label-hint">(opcional)</span></label>
                                        <input type="text" value={operationType} onChange={e => setOperationType(e.target.value)} placeholder="Ej: RIEGO, MANTENIMIENTO" className="text-input" />
                                    </div>
                                    <div>
                                        <label className="input-label">Usuario <span className="label-hint">(opcional)</span></label>
                                        <select value={userId} onChange={e => setUserId(e.target.value)} className="select-input">
                                            <option value="">Todos los usuarios</option>
                                            {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="form-footer">
                        <p className="footer-status-text">
                            {farmId ? '✓ Configuración completa' : '⚠ Seleccione una finca para continuar'}
                        </p>
                        <button onClick={handleGenerateReport} disabled={isGenerating || !farmId} className="generate-button">
                            {isGenerating ? (
                                <> <Loader className="button-icon animate-spin" /> Generando Reporte... </>
                            ) : (
                                <> <FileDown className="button-icon" /> Generar Reporte </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;