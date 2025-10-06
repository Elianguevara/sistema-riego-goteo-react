// Archivo: src/components/maintenance/MaintenanceForm.tsx

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import maintenanceService from '../../services/maintenanceService';
import type { MaintenanceCreateData } from '../../types/maintenance.types';
import '../users/UserForm.css';

interface Props {
    farmId: number;
    equipmentId: number;
    onClose: () => void;
}

const MaintenanceForm = ({ farmId, equipmentId, onClose }: Props) => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        description: '',
        workHours: '1', // Como string
    });

    const mutation = useMutation({
        mutationFn: (data: MaintenanceCreateData) => maintenanceService.createMaintenance(farmId, equipmentId, data),
        onSuccess: () => {
            toast.success('Mantenimiento registrado correctamente.');
            queryClient.invalidateQueries({ queryKey: ['maintenances', equipmentId] });
            onClose();
        },
        onError: (err: Error) => toast.error(err.message),
    });

    // --- INICIO DE LA CORRECCIÓN ---
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const numberRegex = /^[0-9]*\.?[0-9]*$/;

        if (name === 'workHours') {
            if (numberRegex.test(value)) {
                setFormData(prev => ({ ...prev, [name]: value }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    // --- FIN DE LA CORRECCIÓN ---

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.description.trim()) {
            toast.error("La descripción no puede estar vacía.");
            return;
        }

        const dataToSubmit: MaintenanceCreateData = {
            date: formData.date,
            description: formData.description,
            workHours: formData.workHours ? parseFloat(formData.workHours) : undefined,
        };
        
        mutation.mutate(dataToSubmit);
    };

    return (
        <div className="form-container">
            <h3>Registrar Nuevo Mantenimiento</h3>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="description">Descripción del Trabajo Realizado</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Ej: Limpieza de filtros, cambio de aceite..."
                        required
                    />
                </div>
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="date">Fecha</label>
                        <input type="date" id="date" name="date" value={formData.date} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="workHours">Horas de Trabajo (Opcional)</label>
                        {/* Corregido: type="text" y inputMode="decimal" */}
                        <input type="text" inputMode="decimal" id="workHours" name="workHours" value={formData.workHours} onChange={handleChange} step="0.5" />
                    </div>
                </div>
                <div className="form-actions">
                    <button type="button" className="btn-cancel" onClick={onClose} disabled={mutation.isPending}>Cancelar</button>
                    <button type="submit" className="btn-save" disabled={mutation.isPending}>
                        {mutation.isPending ? 'Guardando...' : 'Guardar Registro'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default MaintenanceForm;