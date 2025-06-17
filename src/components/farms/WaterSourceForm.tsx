import React, { useState, useEffect } from 'react';
import type { WaterSource, WaterSourceCreateData, WaterSourceUpdateData } from '../../types/farm.types';
import '../users/UserForm.css';

interface WaterSourceFormProps {
    currentWaterSource: WaterSource | null;
    onSave: (data: WaterSourceCreateData | WaterSourceUpdateData) => void;
    onCancel: () => void;
    isLoading: boolean;
}

// Valores de ejemplo, deberían coincidir con el backend
const WATER_SOURCE_TYPES = ['POZO', 'REPRESA', 'CANAL', 'RIO', 'RED_PUBLICA'];

const WaterSourceForm: React.FC<WaterSourceFormProps> = ({ currentWaterSource, onSave, onCancel, isLoading }) => {
    const [formData, setFormData] = useState<WaterSourceCreateData>({
        type: 'POZO',
    });

    const isEditing = currentWaterSource !== null;

    useEffect(() => {
        if (isEditing && currentWaterSource) {
            setFormData({
                type: currentWaterSource.type,
            });
        }
    }, [currentWaterSource, isEditing]);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormData({ type: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <h3>{isEditing ? 'Editar Fuente de Agua' : 'Añadir Fuente de Agua'}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="type">Tipo de Fuente</label>
                        <select id="type" name="type" value={formData.type} onChange={handleChange}>
                            {WATER_SOURCE_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onCancel} disabled={isLoading}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-save" disabled={isLoading}>
                            {isLoading ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default WaterSourceForm;