// Archivo: src/components/fertilization/FertilizationForm.tsx

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import fertilizationService from '../../services/fertilizationService';
import type { FertilizationCreateData } from '../../types/fertilization.types';
import type { Sector } from '../../types/farm.types';
import '../users/UserForm.css'; // Reutilizamos los estilos

interface Props {
    farmId: number;
    sectors: Sector[];
    onClose: () => void;
}

const FertilizationForm = ({ farmId, sectors, onClose }: Props) => {
    const queryClient = useQueryClient();

    // Estado unificado que coincide con la estructura de la API
    const [formData, setFormData] = useState<FertilizationCreateData>({
        sectorId: 0,
        date: new Date().toISOString().split('T')[0], // Fecha de hoy por defecto
        fertilizerType: '',
        quantity: 25, // Cantidad por defecto
        quantityUnit: 'KG', // Unidad por defecto
    });

    const mutation = useMutation({
        mutationFn: fertilizationService.createFertilizationRecord,
        onSuccess: () => {
            toast.success('Aplicación de fertilizante registrada correctamente.');
            queryClient.invalidateQueries({ queryKey: ['fertilizationRecords', farmId] });
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
        // El formData ya tiene la estructura correcta, lo enviamos directamente
        mutation.mutate(formData);
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
                        <label htmlFor="date">Fecha de Aplicación</label>
                        <input
                            type="date"
                            id="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
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
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="quantity">Cantidad</label>
                        <input
                            type="number"
                            id="quantity"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleChange}
                            step="0.5"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="quantityUnit">Unidad</label>
                        <select id="quantityUnit" name="quantityUnit" value={formData.quantityUnit} onChange={handleChange}>
                            <option value="KG">Kilogramos (KG)</option>
                            <option value="LITERS">Litros (L)</option>
                        </select>
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

export default FertilizationForm;