// Archivo: src/components/logbook/OperationLogForm.tsx

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import operationLogService from '../../services/operationLogService';
import type { OperationLog, OperationLogCreateData } from '../../types/operationLog.types';
import '../users/UserForm.css';

interface Props {
    farmId: number;
    currentLog: OperationLog | null;
    onClose: () => void;
}

const formatDateTimeForInput = (isoString: string | null | undefined): string => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - timezoneOffset);
    return localDate.toISOString().slice(0, 16);
};

const OperationLogForm = ({ farmId, currentLog, onClose }: Props) => {
    const queryClient = useQueryClient();
    const isEditing = currentLog !== null;

    const [formData, setFormData] = useState({
        operationDatetime: formatDateTimeForInput(new Date().toISOString()),
        operationType: '',
        description: '',
    });

    // --- NUEVA LÓGICA: OBTENER TIPOS DE OPERACIÓN DE LA API ---
    const { data: operationTypes = [], isLoading: isLoadingTypes } = useQuery<string[], Error>({
        queryKey: ['operationTypes'],
        queryFn: operationLogService.getOperationTypes,
        staleTime: 1000 * 60 * 60, // Cachear los tipos por 1 hora
    });

    useEffect(() => {
        if (isEditing && currentLog) {
            setFormData({
                operationDatetime: formatDateTimeForInput(currentLog.operationDatetime),
                operationType: currentLog.operationType,
                description: currentLog.description || '',
            });
        }
    }, [currentLog, isEditing]);

    const mutation = useMutation({
        mutationFn: (data: OperationLogCreateData) => {
            return isEditing
                ? operationLogService.updateOperationLog(currentLog!.id, data)
                : operationLogService.createOperationLog(farmId, data);
        },
        onSuccess: () => {
            toast.success(`Entrada de bitácora ${isEditing ? 'actualizada' : 'registrada'}.`);
            queryClient.invalidateQueries({ queryKey: ['operationLogs'] });
            onClose();
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.operationType.trim() || !formData.operationDatetime) {
            toast.error("El tipo de operación y la fecha son obligatorios.");
            return;
        }

        const dataToSubmit: OperationLogCreateData = {
            operationType: formData.operationType,
            operationDatetime: new Date(formData.operationDatetime).toISOString(),
            description: formData.description || undefined,
        };
        
        mutation.mutate(dataToSubmit);
    };

    return (
        <div className="form-container">
            <h3>{isEditing ? 'Editar Entrada' : 'Nueva Entrada'} en Bitácora</h3>
            <form onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="operationType">Tipo de Operación</label>
                        {/* --- CAMBIO DE INPUT A SELECT --- */}
                        <select
                            id="operationType"
                            name="operationType"
                            value={formData.operationType}
                            onChange={handleChange}
                            required
                            disabled={isLoadingTypes}
                        >
                            <option value="" disabled>
                                {isLoadingTypes ? 'Cargando tipos...' : 'Seleccione un tipo...'}
                            </option>
                            {operationTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="operationDatetime">Fecha y Hora del Evento</label>
                        <input type="datetime-local" id="operationDatetime" name="operationDatetime" value={formData.operationDatetime} onChange={handleChange} required />
                    </div>
                </div>
                 <div className="form-group" style={{marginTop: '15px'}}>
                    <label htmlFor="description">Descripción (Opcional)</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Añade detalles adicionales sobre la operación..."
                    />
                </div>
                <div className="form-actions">
                    <button type="button" className="btn-cancel" onClick={onClose} disabled={mutation.isPending}>Cancelar</button>
                    <button type="submit" className="btn-save" disabled={mutation.isPending}>
                        {mutation.isPending ? 'Guardando...' : 'Guardar Entrada'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default OperationLogForm;