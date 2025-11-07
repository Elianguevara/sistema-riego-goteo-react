// src/components/farms/EquipmentForm.tsx

import React, { useState, useEffect } from 'react';
import type { IrrigationEquipment, EquipmentCreateData, EquipmentUpdateData } from '../../types/farm.types';
import '../users/UserForm.css';

interface EquipmentFormProps {
    currentEquipment: IrrigationEquipment | null;
    onSave: (data: EquipmentCreateData | EquipmentUpdateData) => void;
    onCancel: () => void;
    isLoading: boolean;
}

const EQUIPMENT_TYPES = ['BOMBA_AGUA', 'VALVULA_PRINCIPAL', 'FILTRO', 'OTRO'];
const EQUIPMENT_STATUSES = ['ACTIVO', 'INACTIVO', 'MANTENIMIENTO'];

const EquipmentForm: React.FC<EquipmentFormProps> = ({ currentEquipment, onSave, onCancel, isLoading }) => {
    const [formData, setFormData] = useState({
        name: '',
        measuredFlow: '0', // Como string, ahora representa hL/h
        hasFlowMeter: false,
        equipmentType: 'OTRO',
        equipmentStatus: 'ACTIVO',
    });

    const isEditing = currentEquipment !== null;

    useEffect(() => {
        if (isEditing && currentEquipment) {
            setFormData({
                name: currentEquipment.name,
                // Asume que currentEquipment.measuredFlow ahora viene en hL/h
                measuredFlow: String(currentEquipment.measuredFlow),
                hasFlowMeter: currentEquipment.hasFlowMeter,
                equipmentType: currentEquipment.equipmentType,
                equipmentStatus: currentEquipment.equipmentStatus,
            });
        }
    }, [currentEquipment, isEditing]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const numberRegex = /^[0-9]*\.?[0-9]*$/;

        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else if (name === 'measuredFlow') {
            if (numberRegex.test(value)) {
                setFormData(prev => ({ ...prev, [name]: value }));
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSave = {
            ...formData,
            // Envía el valor directamente como hL/h
            measuredFlow: parseFloat(formData.measuredFlow) || 0,
        };
        onSave(dataToSave);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container" style={{maxWidth: '600px'}}>
                <h3>{isEditing ? 'Editar Equipo' : 'Añadir Equipo'}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="name">Nombre del Equipo</label>
                            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="equipmentType">Tipo de Equipo</label>
                            <select id="equipmentType" name="equipmentType" value={formData.equipmentType} onChange={handleChange}>
                                {EQUIPMENT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                            </select>
                        </div>
                         <div className="form-group">
                            {/* Etiqueta actualizada */}
                            <label htmlFor="measuredFlow">Flujo Medido (hL/h)</label>
                            <input type="text" inputMode="decimal" id="measuredFlow" name="measuredFlow" value={formData.measuredFlow} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="equipmentStatus">Estado</label>
                            <select id="equipmentStatus" name="equipmentStatus" value={formData.equipmentStatus} onChange={handleChange}>
                                {EQUIPMENT_STATUSES.map(status => <option key={status} value={status}>{status}</option>)}
                            </select>
                        </div>
                        <div className="form-group checkbox-group">
                            <input type="checkbox" id="hasFlowMeter" name="hasFlowMeter" checked={formData.hasFlowMeter} onChange={handleChange} />
                            <label htmlFor="hasFlowMeter">¿Tiene medidor de flujo?</label>
                        </div>
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onCancel} disabled={isLoading}>Cancelar</button>
                        <button type="submit" className="btn-save" disabled={isLoading}>
                            {isLoading ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EquipmentForm;