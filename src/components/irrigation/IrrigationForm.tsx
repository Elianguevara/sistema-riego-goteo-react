// Archivo: src/components/irrigation/IrrigationForm.tsx

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import irrigationService from '../../services/irrigationService';
// --- Se importa IrrigationRecord para la mutación ---
import type { DailyIrrigationDetail, IrrigationCreateData, IrrigationRecord } from '../../types/irrigation.types';

// Importa su propio archivo de estilos dedicado
import './IrrigationForm.css'; 

interface IrrigationFormProps {
    farmId: number;
    sectorId: number;
    date: string; // Fecha en formato YYYY-MM-DD
    existingRecord: DailyIrrigationDetail | null;
    onClose: () => void;
}

const IrrigationForm = ({ farmId, sectorId, date, existingRecord, onClose }: IrrigationFormProps) => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<IrrigationCreateData>({
        irrigationDate: date,
        startTime: '00:00',
        endTime: '00:00',
        waterVolume: 0,
    });

    useEffect(() => {
        if (existingRecord) {
            setFormData({
                irrigationDate: date,
                startTime: '00:00', // Valor por defecto
                endTime: '00:00',   // Valor por defecto
                waterVolume: existingRecord.waterAmount,
            });
        }
    }, [existingRecord, date]);

    // --- INICIO DE LA CORRECCIÓN: Se especifican los tipos para useMutation ---
    const mutation = useMutation<IrrigationRecord | void, Error, IrrigationCreateData>({
    // --- FIN DE LA CORRECCIÓN ---
        mutationFn: (data: IrrigationCreateData) => {
            if (existingRecord) {
                toast.warning("La edición de riegos aún no está implementada.");
                return Promise.resolve();
            }
            return irrigationService.createIrrigation(farmId, sectorId, data);
        },
        onSuccess: () => {
            toast.success(`Riego ${existingRecord ? 'actualizado' : 'registrado'} correctamente.`);
            queryClient.invalidateQueries({ queryKey: ['irrigations', farmId] });
            onClose();
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate(formData);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <h3>{existingRecord ? 'Editar' : 'Registrar'} Riego</h3>
                <p><strong>Fecha:</strong> {new Date(date + 'T00:00:00').toLocaleDateString()}</p>
                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="startTime">Hora Inicio</label>
                            <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="endTime">Hora Fin</label>
                            <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} required />
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="waterVolume">Volumen de Agua (m³)</label>
                        <input type="number" step="0.1" name="waterVolume" value={formData.waterVolume} onChange={handleChange} required />
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose} disabled={mutation.isPending}>Cancelar</button>
                        <button type="submit" className="btn-save" disabled={mutation.isPending}>
                            {mutation.isPending ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default IrrigationForm;
