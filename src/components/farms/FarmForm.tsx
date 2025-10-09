// src/components/farms/FarmForm.tsx
import React, { useState, useEffect } from 'react';
import type { Farm, FarmCreateData, FarmUpdateData } from '../../types/farm.types';
import LocationPicker from './LocationPicker'; // 1. Importamos el nuevo componente
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
        latitude: '-33.0337', // Coordenadas por defecto (Rivadavia, Mendoza)
        longitude: '-68.4619',
    });

    const isEditing = currentFarm !== null;

    useEffect(() => {
        if (isEditing && currentFarm) {
            setFormData({
                name: currentFarm.name,
                location: currentFarm.location,
                farmSize: String(currentFarm.farmSize),
                reservoirCapacity: String(currentFarm.reservoirCapacity),
                latitude: String(currentFarm.latitude || -33.0337),
                longitude: String(currentFarm.longitude || -68.4619),
            });
        }
    }, [currentFarm, isEditing]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const numberRegex = /^-?[0-9]*\.?[0-9]*$/;
        
        const numericFields = ['farmSize', 'reservoirCapacity'];

        if (numericFields.includes(name)) {
            if (numberRegex.test(value) || value === '') {
                setFormData(prev => ({ ...prev, [name]: value }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // 2. Nueva función para manejar el cambio de ubicación desde el mapa
    const handleLocationChange = ({ lat, lng }: { lat: number; lng: number; }) => {
        setFormData(prev => ({
            ...prev,
            latitude: String(lat),
            longitude: String(lng)
        }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSave = {
          name: formData.name,
          location: formData.location,
          farmSize: parseFloat(formData.farmSize) || 0,
          reservoirCapacity: parseFloat(formData.reservoirCapacity) || 0,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
        };
        onSave(dataToSave);
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
                        <label htmlFor="location">Ubicación (Ej: Ciudad, Provincia)</label>
                        <input type="text" id="location" name="location" value={formData.location} onChange={handleChange} required />
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

                {/* 3. Reemplazamos los inputs por el mapa */}
                <div className="form-group" style={{ marginTop: '20px' }}>
                    <label>Ubicar Finca en el Mapa</label>
                    <LocationPicker 
                        initialPosition={[parseFloat(formData.latitude), parseFloat(formData.longitude)]}
                        onLocationChange={handleLocationChange}
                    />
                     {/* Mostramos las coordenadas seleccionadas (opcional) */}
                    <div className="coords-display">
                        <span>Lat: {parseFloat(formData.latitude).toFixed(4)}</span>
                        <span>Lon: {parseFloat(formData.longitude).toFixed(4)}</span>
                    </div>
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
    );
};

export default FarmForm;