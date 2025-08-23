import React, { useState, useEffect } from 'react';
import type { FertilizationRequest, FertilizationResponse } from '../../types/fertilization.types';
import './FertilizationForm.css';

interface FertilizationFormProps {
    currentFertilization: FertilizationResponse | null;
    sectorId: number;
    onSave: (data: FertilizationRequest | Partial<FertilizationRequest>) => void;
    onCancel: () => void;
    isLoading: boolean;
}

const FertilizationForm: React.FC<FertilizationFormProps> = ({
    currentFertilization,
    sectorId,
    onSave,
    onCancel,
    isLoading,
}) => {
    const [formData, setFormData] = useState({
        fertilizerType: '',
        applicationDate: '',
        quantity: 0,
        unit: 'kg',
    });

    const isEditing = currentFertilization !== null;

    useEffect(() => {
        if (isEditing && currentFertilization) {
            setFormData({
                fertilizerType: currentFertilization.fertilizerType,
                applicationDate: new Date(currentFertilization.applicationDate).toISOString().split('T')[0],
                quantity: currentFertilization.quantity,
                unit: currentFertilization.unit,
            });
        } else {
            setFormData({
                fertilizerType: '',
                applicationDate: '',
                quantity: 0,
                unit: 'kg',
            });
        }
    }, [currentFertilization, isEditing]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isNumber = type === 'number';
        setFormData(prev => ({
            ...prev,
            [name]: isNumber ? parseFloat(value) || 0 : value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing && currentFertilization) {
            onSave(formData);
        } else {
            onSave({ ...formData, sectorId });
        }
    };

    return (
        <div className="form-container">
            <h3>{isEditing ? 'Editar Fertilización' : 'Añadir Fertilización'}</h3>
            <form onSubmit={handleSubmit} className="fertilization-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="fertilizerType">Tipo de Fertilizante</label>
                        <input
                            type="text"
                            id="fertilizerType"
                            name="fertilizerType"
                            value={formData.fertilizerType}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="applicationDate">Fecha de Aplicación</label>
                        <input
                            type="date"
                            id="applicationDate"
                            name="applicationDate"
                            value={formData.applicationDate}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="quantity">Cantidad</label>
                        <input
                            type="number"
                            id="quantity"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="unit">Unidad</label>
                        <select
                            id="unit"
                            name="unit"
                            value={formData.unit}
                            onChange={handleChange}
                            required
                        >
                            <option value="kg">kg</option>
                            <option value="L">L</option>
                            <option value="g">g</option>
                            <option value="mL">mL</option>
                        </select>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn-save" disabled={isLoading}>
                        {isLoading ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button type="button" className="btn-cancel" onClick={onCancel} disabled={isLoading}>
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FertilizationForm;
