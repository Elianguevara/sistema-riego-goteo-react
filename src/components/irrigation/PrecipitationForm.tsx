// Archivo: src/components/precipitation/PrecipitationForm.tsx

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import precipitationService from '../../services/precipitationService';
import type { PrecipitationCreateData } from '../../types/precipitation.types';
import '../users/UserForm.css'; // Reutilizamos los estilos de otros formularios

interface Props {
    farmId: number;
    onClose: () => void;
}

const PrecipitationForm = ({ farmId, onClose }: Props) => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<PrecipitationCreateData>({
        precipitationDate: new Date().toISOString().split('T')[0],
        mmRain: 10,
    });

    const mutation = useMutation({
        mutationFn: (data: PrecipitationCreateData) => precipitationService.createPrecipitation(farmId, data),
        onSuccess: () => {
            toast.success('Precipitación registrada correctamente.');
            // Invalidamos la query de la vista mensual para que se actualice con la nueva lluvia
            queryClient.invalidateQueries({ queryKey: ['irrigations'] });
            onClose();
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate(formData);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <h3>Registrar Precipitación</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="precipitationDate">Fecha</label>
                            <input type="date" id="precipitationDate" name="precipitationDate" value={formData.precipitationDate} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="mmRain">Lluvia (mm)</label>
                            <input type="number" id="mmRain" name="mmRain" value={formData.mmRain} onChange={handleChange} step="0.5" required />
                        </div>
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose} disabled={mutation.isPending}>Cancelar</button>
                        <button type="submit" className="btn-save" disabled={mutation.isPending}>
                            {mutation.isPending ? 'Guardando...' : 'Guardar Registro'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PrecipitationForm;
