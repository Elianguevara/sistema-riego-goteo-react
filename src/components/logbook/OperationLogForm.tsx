// Archivo: src/components/logbook/OperationLogForm.tsx

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import operationLogService from '../../services/operationLogService';
import type { OperationLogCreateData } from '../../types/operationLog.types';
import '../users/UserForm.css'; // Reutilizamos estilos

interface Props {
    farmId: number;
    onClose: () => void;
}

const OperationLogForm = ({ farmId, onClose }: Props) => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<OperationLogCreateData>({
        logDate: new Date().toISOString().split('T')[0],
        description: '',
    });

    const mutation = useMutation({
        mutationFn: (data: OperationLogCreateData) => operationLogService.createOperationLog(farmId, data),
        onSuccess: () => {
            toast.success('Entrada de bitácora registrada.');
            queryClient.invalidateQueries({ queryKey: ['operationLogs', farmId] });
            onClose();
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.description.trim()) {
            toast.error("La descripción no puede estar vacía.");
            return;
        }
        mutation.mutate(formData);
    };

    return (
        <div className="form-container">
            <h3>Nueva Entrada en Bitácora</h3>
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
                <div className="form-group">
                    <label htmlFor="logDate">Fecha del Evento</label>
                    <input type="date" id="logDate" name="logDate" value={formData.logDate} onChange={handleChange} required />
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