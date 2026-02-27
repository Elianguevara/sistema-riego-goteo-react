import React, { useState, useEffect } from 'react';
import type { Sector, SectorCreateData, SectorUpdateData, IrrigationEquipment } from '../../types/farm.types';
import '../users/UserForm.css'; // Reutilizamos estilos
import Modal from '../ui/Modal';

interface SectorFormProps {
    currentSector: Sector | null;
    availableEquipment: IrrigationEquipment[];
    onSave: (data: SectorCreateData | SectorUpdateData) => void;
    onCancel: () => void;
    isLoading: boolean;
}

const SectorForm: React.FC<SectorFormProps> = ({ currentSector, availableEquipment, onSave, onCancel, isLoading }) => {
    const [formData, setFormData] = useState<SectorCreateData>({
        name: '',
        equipmentId: undefined,
    });

    const isEditing = currentSector !== null;

    useEffect(() => {
        if (isEditing && currentSector) {
            setFormData({
                name: currentSector.name,
                equipmentId: currentSector.equipmentId,
            });
        } else {
            setFormData({ name: '', equipmentId: undefined });
        }
    }, [currentSector, isEditing]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'equipmentId' ? (value ? parseInt(value) : undefined) : value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <Modal isOpen={true} onClose={onCancel}>
                <h3>{isEditing ? 'Editar Sector' : 'Añadir Sector'}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Nombre del Sector</label>
                        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="equipmentId">Equipo de Riego (Opcional)</label>
                        <select id="equipmentId" name="equipmentId" value={formData.equipmentId || ''} onChange={handleChange}>
                            <option value="">Ninguno</option>
                            {availableEquipment.map(eq => (
                                <option key={eq.id} value={eq.id}>
                                    {eq.name} ({eq.equipmentType})
                                </option>
                            ))}
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
        </Modal>
    );
};

export default SectorForm;