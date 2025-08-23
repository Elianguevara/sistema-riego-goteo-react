// Archivo: src/components/irrigation/IrrigationForm.tsx

import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import irrigationService from '../../services/irrigationService';
import farmService from '../../services/farmService'; // Necesario para obtener equipos
import type { IrrigationCreateData, IrrigationRecord } from '../../types/irrigation.types';
import type { IrrigationEquipment } from '../../types/farm.types';
import './IrrigationForm.css';

interface IrrigationFormProps {
    farmId: number;
    sectorId: number;
    date: string; // Fecha en formato YYYY-MM-DD
    onClose: () => void;
}

const IrrigationForm = ({ farmId, sectorId, date, onClose }: IrrigationFormProps) => {
    const queryClient = useQueryClient();

    // Cargar equipos de la finca
    const { data: equipment = [], isLoading: isLoadingEquipment } = useQuery<IrrigationEquipment[], Error>({
        queryKey: ['equipments', farmId],
        queryFn: () => farmService.getEquipmentsByFarm(farmId),
        enabled: !!farmId,
    });

    // Estados para el formulario
    const [startTime, setStartTime] = useState('08:00');
    const [irrigationHours, setIrrigationHours] = useState(1);
    const [waterAmount, setWaterAmount] = useState(10); // Valor por defecto
    const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>('');

    // Lógica para calcular fechas de inicio y fin en formato ISO
    const { startDateTime, endDateTime } = useMemo(() => {
        if (!date || !startTime || irrigationHours <= 0) {
            return { startDateTime: null, endDateTime: null };
        }
        const start = new Date(`${date}T${startTime}`);
        const end = new Date(start.getTime() + irrigationHours * 60 * 60 * 1000);
        return {
            startDateTime: start.toISOString().slice(0, 19), // Formato "YYYY-MM-DDTHH:mm:ss"
            endDateTime: end.toISOString().slice(0, 19),
        };
    }, [date, startTime, irrigationHours]);


    const mutation = useMutation<IrrigationRecord, Error, IrrigationCreateData>({
        mutationFn: irrigationService.createIrrigation, // Llama al servicio actualizado
        onSuccess: () => {
            toast.success('Riego registrado correctamente.');
            queryClient.invalidateQueries({ queryKey: ['irrigations', farmId] });
            onClose();
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!startDateTime || !endDateTime || !selectedEquipmentId) {
            toast.error("Por favor, complete todos los campos requeridos.");
            return;
        }

        const formData: IrrigationCreateData = {
            startDateTime,
            endDateTime,
            waterAmount: parseFloat(waterAmount.toString()),
            irrigationHours: parseFloat(irrigationHours.toString()),
            sectorId,
            equipmentId: parseInt(selectedEquipmentId, 10),
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
                         <div className="form-group">
                            <label htmlFor="equipmentId">Equipo</label>
                            <select name="equipmentId" value={selectedEquipmentId} onChange={(e) => setSelectedEquipmentId(e.target.value)} required disabled={isLoadingEquipment}>
                                <option value="">{isLoadingEquipment ? 'Cargando...' : 'Seleccione equipo'}</option>
                                {equipment.map(eq => (
                                    <option key={eq.id} value={eq.id}>{eq.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="waterAmount">Cantidad de Agua (m³)</label>
                            <input type="number" step="0.1" name="waterAmount" value={waterAmount} onChange={(e) => setWaterAmount(parseFloat(e.target.value) || 0)} required />
                        </div>
                    </div>
                     <div className="form-group calculated-field">
                        <label>Fecha y Hora de Fin (Calculada)</label>
                        <input type="text" value={endDateTime ? new Date(endDateTime).toLocaleString('es-AR') : ''} disabled />
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose} disabled={mutation.isPending}>Cancelar</button>
                        <button type="submit" className="btn-save" disabled={mutation.isPending || !endDateTime || !selectedEquipmentId}>
                            {mutation.isPending ? 'Guardando...' : 'Guardar Riego'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default IrrigationForm;