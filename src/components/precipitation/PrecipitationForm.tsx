// Archivo: src/components/precipitation/PrecipitationForm.tsx

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import precipitationService from '../../services/precipitationService';
import type { PrecipitationCreateData } from '../../types/precipitation.types';
import PrecipitationList from './PrecipitationList';
import '../users/UserForm.css';

interface Props {
    farmId: number;
    date: string;
    onClose: () => void;
}

const PrecipitationForm = ({ farmId, date, onClose }: Props) => {
    const queryClient = useQueryClient();

    const [formState, setFormState] = useState({
        precipitationDate: date,
        mmRain: '10',
    });

    const mutation = useMutation({
        mutationFn: (data: PrecipitationCreateData) => precipitationService.createPrecipitation(farmId, data),
        onSuccess: () => {
            toast.success('Precipitación registrada correctamente.');
            queryClient.invalidateQueries({ queryKey: ['irrigations'] });
            queryClient.invalidateQueries({ queryKey: ['precipitationHistory', farmId] });
            // No cerramos el modal inmediatamente si queremos ver el historial, 
            // pero el requerimiento original dice onClose(). 
            // Podríamos dejarlo así o cambiarlo. Mantendré onClose() por ahora.
            onClose();
        },
        onError: (err: Error) => toast.error(err.message),
    });

    // --- INICIO DE LA CORRECCIÓN ---
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        // Expresión regular para validar números (enteros o decimales)
        const numberRegex = /^[0-9]*\.?[0-9]*$/;

        if (name === 'mmRain') {
            // Solo actualiza el estado si el valor es numérico o un campo vacío
            if (numberRegex.test(value)) {
                setFormState(prev => ({ ...prev, [name]: value }));
            }
        } else {
            setFormState(prev => ({ ...prev, [name]: value }));
        }
    };
    // --- FIN DE LA CORRECCIÓN ---

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSubmit: PrecipitationCreateData = {
            precipitationDate: formState.precipitationDate,
            mmRain: parseFloat(formState.mmRain) || 0,
        };
        mutation.mutate(dataToSubmit);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <h3>Registrar Precipitación para el {new Date(date + 'T00:00:00').toLocaleDateString()}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="precipitationDate">Fecha</label>
                            <input type="date" id="precipitationDate" name="precipitationDate" value={formState.precipitationDate} readOnly />
                        </div>
                        <div className="form-group">
                            <label htmlFor="mmRain">Lluvia (mm)</label>
                            <input type="text" inputMode="decimal" id="mmRain" name="mmRain" value={formState.mmRain} onChange={handleChange} required />
                        </div>
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose} disabled={mutation.isPending}>Cancelar</button>
                        <button type="submit" className="btn-save" disabled={mutation.isPending}>
                            {mutation.isPending ? 'Guardando...' : 'Guardar Registro'}
                        </button>
                    </div>
                </form>

                <PrecipitationList farmId={farmId} />
            </div>
        </div>
    );
};

export default PrecipitationForm;