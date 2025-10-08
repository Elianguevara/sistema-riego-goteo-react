// Archivo: src/pages/analyst/Reports.tsx

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import farmService from '../../services/farmService';
import reportService from '../../services/reportService';
import type { Farm, Sector } from '../../types/farm.types';
import type { UserResponse } from '../../types/user.types';
import { FileDown, Loader } from 'lucide-react';
import './Reports.css';

const Reports = () => {
    const today = new Date().toISOString().split('T')[0];
    const [reportType, setReportType] = useState('WATER_BALANCE');
    const [farmId, setFarmId] = useState<number | undefined>();
    const [sectorIds, setSectorIds] = useState<string[]>([]);
    const [operationType, setOperationType] = useState('');
    const [userId, setUserId] = useState<string>('');
    const [format, setFormat] = useState('PDF');
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [isDownloading, setIsDownloading] = useState(false);

    // --- Queries para llenar los selectores del formulario ---
    const { data: farms = [] } = useQuery<Farm[]>({ queryKey: ['farms'], queryFn: farmService.getFarms });
    const { data: sectors = [] } = useQuery<Sector[]>({
        queryKey: ['sectors', farmId],
        queryFn: () => farmService.getSectorsByFarm(farmId!),
        enabled: !!farmId,
    });
    
    // --- CORRECCIÓN ---
    // Se cambia la llamada a un endpoint de admin por uno más específico que el Analista puede consumir.
    // Esta llamada obtiene solo los usuarios asignados a la finca seleccionada.
    const { data: users = [] } = useQuery<UserResponse[]>({
        queryKey: ['assignedUsersForReport', farmId],
        queryFn: () => farmService.getAssignedUsers(farmId!),
        enabled: !!farmId && reportType === 'OPERATIONS_LOG', // Solo se activa cuando es necesario
    });


    const handleGenerateReport = async () => {
        if (!farmId) {
            toast.error('Por favor, seleccione una finca.');
            return;
        }
        setIsDownloading(true);

        const params = new URLSearchParams({
            reportType,
            farmId: String(farmId),
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
        
        await reportService.downloadReport(params);
        setIsDownloading(false);
    };

    const handleSectorToggle = (sectorId: string) => {
        setSectorIds(prev =>
            prev.includes(sectorId)
                ? prev.filter(id => id !== sectorId)
                : [...prev, sectorId]
        );
    };

    return (
        <div className="reports-page">
            <div className="page-header">
                <h1><FileDown /> Generación de Reportes</h1>
            </div>

            <div className="report-form-container">
                <div className="form-grid">
                    <div className="form-group">
                        <label>Tipo de Reporte</label>
                        <select value={reportType} onChange={e => setReportType(e.target.value)}>
                            <option value="WATER_BALANCE">Balance Hídrico</option>
                            <option value="OPERATIONS_LOG">Bitácora de Operaciones</option>
                            <option value="PERIOD_SUMMARY">Resumen del Período</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Formato</label>
                        <select value={format} onChange={e => setFormat(e.target.value)}>
                            <option value="PDF">PDF</option>
                            <option value="CSV">CSV</option>
                            <option value="XLSX">Excel (XLSX)</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Finca</label>
                        <select value={farmId} onChange={e => setFarmId(Number(e.target.value))}>
                             <option value="">Seleccione una finca...</option>
                            {farms.map(farm => <option key={farm.id} value={farm.id}>{farm.name}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Fecha de Inicio</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                    </div>
                     <div className="form-group">
                        <label>Fecha de Fin</label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                    </div>
                </div>

                {/* Filtros Condicionales */}
                {reportType === 'WATER_BALANCE' && (
                    <div className="form-group">
                        <label>Sectores (opcional, si no se selecciona, se incluyen todos)</label>
                        <div className="checkbox-group">
                            {sectors.map(sector => (
                                <label key={sector.id}>
                                    <input type="checkbox" value={sector.id} onChange={() => handleSectorToggle(String(sector.id))} checked={sectorIds.includes(String(sector.id))}/>
                                    {sector.name}
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {reportType === 'OPERATIONS_LOG' && (
                    <div className="form-grid conditional-filters">
                        <div className="form-group">
                            <label>Tipo de Operación (opcional)</label>
                            <input type="text" value={operationType} onChange={e => setOperationType(e.target.value)} placeholder="Ej: RIEGO, MANTENIMIENTO"/>
                        </div>
                        <div className="form-group">
                            <label>Usuario (opcional)</label>
                            <select value={userId} onChange={e => setUserId(e.target.value)}>
                                <option value="">Todos los usuarios</option>
                                {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                            </select>
                        </div>
                    </div>
                )}
                
                <div className="form-actions">
                    <button onClick={handleGenerateReport} disabled={isDownloading || !farmId} className="btn-generate">
                        {isDownloading ? <Loader className="spinner" size={18} /> : <FileDown size={18} />}
                        {isDownloading ? 'Generando...' : 'Generar Reporte'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Reports;
