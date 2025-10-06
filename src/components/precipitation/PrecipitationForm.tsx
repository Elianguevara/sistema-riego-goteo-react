// Archivo: src/components/precipitation/PrecipitationForm.tsx

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import precipitationService from '../../services/precipitationService';
import type { PrecipitationCreateData } from '../../types/precipitation.types';
import '../users/UserForm.css'; // Reutilizamos los estilos de otros formularios

// 1. AÑADIMOS 'date' A LAS PROPIEDADES REQUERIDAS
interface Props {
    farmId: number;
    date: string; // <-- La fecha del día seleccionado
    onClose: () => void;
}

const PrecipitationForm = ({ farmId, date, onClose }: Props) => {
    const queryClient = useQueryClient();
    
    // 2. USAMOS LA FECHA RECIBIDA PARA INICIALIZAR EL FORMULARIO
    const [formData, setFormData] = useState<PrecipitationCreateData>({
        precipitationDate: date,
        mmRain: 10,
    });

    const mutation = useMutation({
        mutationFn: (data: PrecipitationCreateData) => precipitationService.createPrecipitation(farmId, data),
        onSuccess: () => {
            toast.success('Precipitación registrada correctamente.');
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
                <h3>Registrar Precipitación para el {new Date(date + 'T00:00:00').toLocaleDateString('es-AR')}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="precipitationDate">Fecha</label>
                            {/* 3. EL CAMPO DE FECHA AHORA ES DE SOLO LECTURA PARA EVITAR ERRORES */}
                            <input type="date" id="precipitationDate" name="precipitationDate" value={formData.precipitationDate} readOnly />
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