import React, { useState, useEffect } from 'react';
import type { Farm, FarmCreateData, FarmUpdateData } from '../../types/farm.types';
import '../users/UserForm.css'; // Reutilizamos los estilos del UserForm

interface FarmFormProps {
    currentFarm: Farm | null;
    onSave: (data: FarmCreateData | FarmUpdateData) => void;
    onCancel: () => void;
    isLoading: boolean;
}

const FarmForm: React.FC<FarmFormProps> = ({ currentFarm, onSave, onCancel, isLoading }) => {
    const [formData, setFormData] = useState<FarmCreateData>({
        name: '',
        location: '',
        farmSize: 0,
        reservoirCapacity: 0,
    });

    const isEditing = currentFarm !== null;

    useEffect(() => {
        if (isEditing && currentFarm) {
            setFormData({
                name: currentFarm.name,
                location: currentFarm.location,
                farmSize: currentFarm.farmSize,
                reservoirCapacity: currentFarm.reservoirCapacity,
            });
        } else {
            setFormData({ name: '', location: '', farmSize: 0, reservoirCapacity: 0 });
        }
    }, [currentFarm, isEditing]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'number' ? parseFloat(value) || 0 : value 
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="form-container">
            <h3>{isEditing ? 'Editar Finca' : 'Crear Finca'}</h3>
            <form onSubmit={handleSubmit} className="user-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="name">Nombre de la Finca</label>
                        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="location">Ubicación</label>
                        <input type="text" id="location" name="location" value={formData.location} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="farmSize">Tamaño (hectáreas)</label>
                        <input type="number" id="farmSize" name="farmSize" value={formData.farmSize} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="reservoirCapacity">Capacidad de Reserva (litros)</label>
                        <input type="number" id="reservoirCapacity" name="reservoirCapacity" value={formData.reservoirCapacity} onChange={handleChange} required />
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

export default FarmForm;