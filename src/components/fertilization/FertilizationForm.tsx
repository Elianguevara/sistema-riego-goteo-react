// Archivo: src/components/fertilization/FertilizationForm.tsx

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import fertilizationService from '../../services/fertilizationService';
import type { FertilizationCreateData } from '../../types/fertilization.types';
import type { Sector } from '../../types/farm.types';
import '../users/UserForm.css';

interface Props {
    farmId: number;
    sectors: Sector[];
    onClose: () => void;
}

const FertilizationForm = ({ farmId, sectors, onClose }: Props) => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<Omit<FertilizationCreateData, 'fertilizationDate'>>({
        fertilizerType: '',
        quantityKg: 25,
        sectorId: 0,
    });
    
    // Establece la fecha de hoy por defecto
    const [fertilizationDate, setFertilizationDate] = useState(new Date().toISOString().split('T')[0]);

    const mutation = useMutation({
        mutationFn: fertilizationService.createFertilizationRecord,
        onSuccess: () => {
            toast.success('Aplicación de fertilizante registrada correctamente.');
            queryClient.invalidateQueries({ queryKey: ['fertilizationRecords', farmId] }); // Opcional, para futuras vistas
            onClose();
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.sectorId || !formData.fertilizerType) {
            toast.error("Por favor, seleccione un sector y especifique el tipo de fertilizante.");
            return;
        }
        const recordData: FertilizationCreateData = {
            ...formData,
            sectorId: Number(formData.sectorId),
            fertilizationDate,
        };
        mutation.mutate(recordData);
    };

    return (
        <div className="form-container">
            <h3>Nueva Aplicación de Fertilizante</h3>
            <form onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="sectorId">Sector</label>
                        <select id="sectorId" name="sectorId" value={formData.sectorId} onChange={handleChange} required>
                            <option value={0} disabled>Seleccione un sector...</option>
                            {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                     <div className="form-group">
                        <label htmlFor="fertilizationDate">Fecha de Aplicación</label>
                        <input
                            type="date"
                            id="fertilizationDate"
                            name="fertilizationDate"
                            value={fertilizationDate}
                            onChange={(e) => setFertilizationDate(e.target.value)}
                            required
                        />
                    </div>
                </div>
                <div className="form-group">
                    <label htmlFor="fertilizerType">Tipo de Fertilizante</label>
                    <input
                        type="text"
                        id="fertilizerType"
                        name="fertilizerType"
                        value={formData.fertilizerType}
                        onChange={handleChange}
                        placeholder="Ej: Nitrato de Amonio"
                        required
                    />
                </div>
                 <div className="form-group">
                    <label htmlFor="quantityKg">Cantidad (Kg)</label>
                    <input
                        type="number"
                        id="quantityKg"
                        name="quantityKg"
                        value={formData.quantityKg}
                        onChange={handleChange}
                        step="0.5"
                        required
                    />
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

export default FertilizationForm;