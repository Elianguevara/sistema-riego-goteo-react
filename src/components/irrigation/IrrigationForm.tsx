// Archivo: src/components/irrigation/IrrigationForm.tsx

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import irrigationService from '../../services/irrigationService';
import type { IrrigationCreateData, IrrigationRecord } from '../../types/irrigation.types';
import './IrrigationForm.css';

interface IrrigationFormProps {
    farmId: number;
    sectorId: number;
    date: string; // Fecha en formato YYYY-MM-DD
    onClose: () => void; // CORRECCIÓN: Se elimina la prop 'existingRecord' que no se usaba
}

const IrrigationForm = ({ farmId, sectorId, date, onClose }: IrrigationFormProps) => {
    const queryClient = useQueryClient();

    const [startTime, setStartTime] = useState('08:00');
    const [irrigationHours, setIrrigationHours] = useState(1);
    const [endTime, setEndTime] = useState('');
    const [waterVolume, setWaterVolume] = useState(0);

    useEffect(() => {
        if (startTime && irrigationHours > 0) {
            const [hours, minutes] = startTime.split(':').map(Number);
            const startDate = new Date();
            startDate.setHours(hours, minutes, 0, 0);

            const durationInMinutes = irrigationHours * 60;
            startDate.setMinutes(startDate.getMinutes() + durationInMinutes);

            const endHours = String(startDate.getHours()).padStart(2, '0');
            const endMinutes = String(startDate.getMinutes()).padStart(2, '0');
            setEndTime(`${endHours}:${endMinutes}`);
        }
    }, [startTime, irrigationHours]);


    const mutation = useMutation<IrrigationRecord, Error, IrrigationCreateData>({
        mutationFn: (data: IrrigationCreateData) => {
            return irrigationService.createIrrigation(farmId, sectorId, data);
        },
        onSuccess: () => {
            toast.success('Riego registrado correctamente.');
            queryClient.invalidateQueries({ queryKey: ['irrigations', farmId] });
            onClose();
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData: IrrigationCreateData = {
            irrigationDate: date,
            startTime,
            endTime,
            waterVolume,
        };
        mutation.mutate(formData);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <h3>Registrar Riego</h3>
                <p><strong>Fecha:</strong> {new Date(date + 'T00:00:00').toLocaleDateString('es-AR', {day: '2-digit', month: '2-digit', year: 'numeric'})}</p>
                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="startTime">Hora Inicio</label>
                            <input type="time" name="startTime" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="irrigationHours">Horas de Riego</label>
                            <input type="number" step="0.5" name="irrigationHours" value={irrigationHours} onChange={(e) => setIrrigationHours(parseFloat(e.target.value) || 0)} required />
                        </div>
                    </div>
                    <div className="form-group calculated-field">
                        <label>Hora de Finalización (Calculada)</label>
                        <input type="time" name="endTime" value={endTime} disabled />
                    </div>
                    <div className="form-group">
                        <label htmlFor="waterVolume">Volumen de Agua (m³)</label>
                        <input type="number" step="0.1" name="waterVolume" value={waterVolume} onChange={(e) => setWaterVolume(parseFloat(e.target.value) || 0)} required />
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose} disabled={mutation.isPending}>Cancelar</button>
                        <button type="submit" className="btn-save" disabled={mutation.isPending || !endTime}>
                            {mutation.isPending ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default IrrigationForm;