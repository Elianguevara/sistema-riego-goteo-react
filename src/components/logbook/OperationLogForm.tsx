// Archivo: src/components/logbook/OperationLogForm.tsx

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import operationLogService from '../../services/operationLogService';
import type { OperationLog, OperationLogCreateData } from '../../types/operationLog.types';
import '../users/UserForm.css'; // Reutilizamos estilos

interface Props {
    farmId: number;
    currentLog: OperationLog | null; // Recibe el log actual para edición
    onClose: () => void;
    onSave: () => void; // Función para notificar que se guardó
}

// Helper para formatear fechas para el input datetime-local
const formatDateTimeForInput = (isoString: string | null | undefined): string => {
    if (!isoString) return '';
    const date = new Date(isoString);
    // Ajusta por la zona horaria para mostrar la hora local correcta en el input
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - timezoneOffset);
    return localDate.toISOString().slice(0, 16);
};


const OperationLogForm = ({ farmId, currentLog, onClose, onSave }: Props) => {
    const queryClient = useQueryClient();
    const isEditing = currentLog !== null;

    const [formData, setFormData] = useState({
        startDatetime: formatDateTimeForInput(new Date().toISOString()),
        endDatetime: '',
        description: '',
    });

    useEffect(() => {
        if (isEditing && currentLog) {
            setFormData({
                startDatetime: formatDateTimeForInput(currentLog.startDatetime),
                endDatetime: formatDateTimeForInput(currentLog.endDatetime),
                description: currentLog.description,
            });
        }
    }, [currentLog, isEditing]);


    const mutation = useMutation({
        mutationFn: (data: OperationLogCreateData) => {
            if (isEditing) {
                return operationLogService.updateOperationLog(currentLog!.id, data);
            }
            return operationLogService.createOperationLog(farmId, data);
        },
        onSuccess: () => {
            toast.success(`Entrada de bitácora ${isEditing ? 'actualizada' : 'registrada'}.`);
            queryClient.invalidateQueries({ queryKey: ['operationLogs', farmId] });
            onSave(); // Llama a la función onSave para que el padre cierre el modal
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.description.trim() || !formData.startDatetime) {
            toast.error("La descripción y la fecha de inicio son obligatorias.");
            return;
        }

        // --- LÓGICA DE ENVÍO CORREGIDA ---
        const dataToSubmit: any = {
            description: formData.description,
            startDatetime: new Date(formData.startDatetime).toISOString(),
        };

        // Solo añadimos endDatetime al objeto si tiene un valor
        if (formData.endDatetime) {
            dataToSubmit.endDatetime = new Date(formData.endDatetime).toISOString();
        }
        
        mutation.mutate(dataToSubmit);
    };

    return (
        <div className="form-container">
            <h3>{isEditing ? 'Editar Entrada' : 'Nueva Entrada'} en Bitácora</h3>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="description">Descripción del Evento</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Ej: Se finalizó la cosecha del sector Viñedo Norte."
                        required
                    />
                </div>
                <div className="form-grid">
                     <div className="form-group">
                        <label htmlFor="startDatetime">Fecha y Hora de Inicio</label>
                        <input type="datetime-local" id="startDatetime" name="startDatetime" value={formData.startDatetime} onChange={handleChange} required />
                    </div>
                     <div className="form-group">
                        <label htmlFor="endDatetime">Fecha y Hora de Fin (Opcional)</label>
                        <input type="datetime-local" id="endDatetime" name="endDatetime" value={formData.endDatetime} onChange={handleChange} />
                    </div>
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