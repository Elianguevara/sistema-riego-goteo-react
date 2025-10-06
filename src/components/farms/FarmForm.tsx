// src/components/farms/FarmForm.tsx
import React, { useState, useEffect } from 'react';
import type { Farm, FarmCreateData, FarmUpdateData } from '../../types/farm.types';
import '../users/UserForm.css';

interface FarmFormProps {
    currentFarm: Farm | null;
    onSave: (data: FarmCreateData | FarmUpdateData) => void;
    onCancel: () => void;
    isLoading: boolean;
}

const FarmForm: React.FC<FarmFormProps> = ({ currentFarm, onSave, onCancel, isLoading }) => {
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        farmSize: '0',
        reservoirCapacity: '0',
        latitude: '0',
        longitude: '0',
    });

    const isEditing = currentFarm !== null;

    useEffect(() => {
        if (isEditing && currentFarm) {
            setFormData({
                name: currentFarm.name,
                location: currentFarm.location,
                farmSize: String(currentFarm.farmSize),
                reservoirCapacity: String(currentFarm.reservoirCapacity),
                latitude: String(currentFarm.latitude || 0),
                longitude: String(currentFarm.longitude || 0),
            });
        } else {
            setFormData({ name: '', location: '', farmSize: '0', reservoirCapacity: '0', latitude: '0', longitude: '0' });
        }
    }, [currentFarm, isEditing]);

    // --- INICIO DE LA CORRECCIÓN ---
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const numberRegex = /^-?[0-9]*\.?[0-9]*$/; // Permite negativos para coordenadas

        const numericFields = ['farmSize', 'reservoirCapacity', 'latitude', 'longitude'];

        if (numericFields.includes(name)) {
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
        const dataToSave = {
          name: formData.name,
          location: formData.location,
          farmSize: parseFloat(formData.farmSize) || 0,
          reservoirCapacity: parseFloat(formData.reservoirCapacity) || 0,
          latitude: parseFloat(formData.latitude) || 0,
          longitude: parseFloat(formData.longitude) || 0,
        };
        onSave(dataToSave);
    };

    return (
        <div className="form-container">
            <h3>{isEditing ? 'Editar Finca' : 'Crear Finca'}</h3>
            <form onSubmit={handleSubmit} className="user-form">
                <div className="form-grid">
                    {/* ... campos de texto ... */}
                    <div className="form-group">
                        <label htmlFor="latitude">Latitud</label>
                        <input type="text" inputMode="decimal" id="latitude" name="latitude" value={formData.latitude} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="longitude">Longitud</label>
                        <input type="text" inputMode="decimal" id="longitude" name="longitude" value={formData.longitude} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="farmSize">Tamaño (hectáreas)</label>
                        <input type="text" inputMode="decimal" id="farmSize" name="farmSize" value={formData.farmSize} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="reservoirCapacity">Capacidad de Reserva (litros)</label>
                        <input type="text" inputMode="decimal" id="reservoirCapacity" name="reservoirCapacity" value={formData.reservoirCapacity} onChange={handleChange} required />
                    </div>
                </div>
                {/* ... botones ... */}
            </form>
        </div>
    );
};

export default FarmForm;