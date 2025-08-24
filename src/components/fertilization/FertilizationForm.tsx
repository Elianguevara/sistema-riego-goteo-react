// Archivo: src/components/fertilization/FertilizationForm.tsx

import { useState, useEffect } from 'react';
import type { FertilizationCreateData, FertilizationRecord } from '../../types/fertilization.types';
import type { Sector } from '../../types/farm.types';
import '../users/UserForm.css';

interface Props {
    farmId: number;
    sectors: Sector[];
    currentFertilization: FertilizationRecord | null;
    onSave: (data: FertilizationCreateData | Partial<FertilizationCreateData>) => void;
    onClose: () => void;
    isLoading: boolean;
}

const FertilizationForm = ({ farmId, sectors, currentFertilization, onSave, onClose, isLoading }: Props) => {
    const isEditing = currentFertilization !== null;
    
    const [formData, setFormData] = useState({
        sectorId: currentFertilization?.sectorId || sectors[0]?.id || 0,
        date: currentFertilization?.date || new Date().toISOString().split('T')[0],
        fertilizerType: currentFertilization?.fertilizerType || '',
        quantity: currentFertilization?.quantity || 25,
        quantityUnit: currentFertilization?.quantityUnit || 'KG' as 'KG' | 'LITERS',
    });

    useEffect(() => {
        if (isEditing && currentFertilization) {
            setFormData({
                sectorId: currentFertilization.sectorId,
                date: currentFertilization.date,
                fertilizerType: currentFertilization.fertilizerType,
                quantity: currentFertilization.quantity,
                quantityUnit: currentFertilization.quantityUnit,
            });
        }
    }, [currentFertilization, isEditing]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <h3>{isEditing ? 'Editar' : 'Nueva'} Aplicación de Fertilizante</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="sectorId">Sector</label>
                        <select id="sectorId" name="sectorId" value={formData.sectorId} onChange={handleChange} required disabled={isEditing}>
                            <option value={0} disabled>Seleccione un sector...</option>
                            {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="date">Fecha de Aplicación</label>
                        <input type="date" id="date" name="date" value={formData.date} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="fertilizerType">Tipo de Fertilizante</label>
                        <input type="text" id="fertilizerType" name="fertilizerType" value={formData.fertilizerType} onChange={handleChange} placeholder="Ej: Nitrato de Amonio" required />
                    </div>
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="quantity">Cantidad</label>
                            <input type="number" id="quantity" name="quantity" value={formData.quantity} onChange={handleChange} step="0.5" required />
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
                        <button type="button" className="btn-cancel" onClick={onClose} disabled={isLoading}>Cancelar</button>
                        <button type="submit" className="btn-save" disabled={isLoading}>
                            {isLoading ? 'Guardando...' : 'Guardar Registro'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FertilizationForm;
