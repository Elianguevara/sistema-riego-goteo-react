// Archivo: src/components/irrigation/IrrigationForm.tsx

import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import irrigationService from '../../services/irrigationService';
import farmService from '../../services/farmService';
import type { IrrigationCreateData, IrrigationRecord } from '../../types/irrigation.types';
import type { IrrigationEquipment, Sector } from '../../types/farm.types';
import '../users/ChangePasswordModal.css';

interface IrrigationFormProps {
    farmId: number;
    sector: Sector;
    date: string;
    onClose: () => void;
}

const IrrigationForm = ({ farmId, sector, date, onClose }: IrrigationFormProps) => {
    const queryClient = useQueryClient();

    const { data: allEquipment = [], isLoading: isLoadingEquipment } = useQuery<IrrigationEquipment[], Error>({
        queryKey: ['equipments', farmId],
        queryFn: () => farmService.getEquipmentsByFarm(farmId),
    });

    const [startTime, setStartTime] = useState('08:00');
    const [irrigationHours, setIrrigationHours] = useState('1');
    const [waterAmount, setWaterAmount] = useState('10');
    const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>(sector.equipmentId?.toString() || '');

    useEffect(() => {
        if (sector.equipmentId) {
            setSelectedEquipmentId(sector.equipmentId.toString());
        }
    }, [sector]);

    const { startDateTime, endDateTime } = useMemo(() => {
        const hours = parseFloat(irrigationHours);
        if (!date || !startTime || !hours || hours <= 0) {
            return { startDateTime: null, endDateTime: null };
        }
        
        const start = new Date(`${date}T${startTime}`);
        const finalStartDateTime = `${date}T${startTime}:00`;

        const end = new Date(start.getTime() + hours * 3600 * 1000);
        const finalEndDateTime = end.getFullYear() +
            '-' + String(end.getMonth() + 1).padStart(2, '0') +
            '-' + String(end.getDate()).padStart(2, '0') +
            'T' + String(end.getHours()).padStart(2, '0') +
            ':' + String(end.getMinutes()).padStart(2, '0') +
            ':' + String(end.getSeconds()).padStart(2, '0');

        return {
            startDateTime: finalStartDateTime,
            endDateTime: finalEndDateTime,
        };
    }, [date, startTime, irrigationHours]);

    const mutation = useMutation<IrrigationRecord, Error, IrrigationCreateData>({
        mutationFn: irrigationService.createIrrigation,
        onSuccess: () => {
            toast.success('Riego registrado correctamente.');
            queryClient.invalidateQueries({ queryKey: ['irrigations', farmId] });
            onClose();
        },
        onError: (err: Error) => toast.error(err.message),
    });

    // --- INICIO DE LA CORRECCIÓN ---
    const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const numberRegex = /^[0-9]*\.?[0-9]*$/; // Regex para validar números decimales positivos

        if (numberRegex.test(value)) {
            if (name === 'irrigationHours') {
                setIrrigationHours(value);
            } else if (name === 'waterAmount') {
                setWaterAmount(value);
            }
        }
    };
    // --- FIN DE LA CORRECCIÓN ---

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!startDateTime || !endDateTime || !selectedEquipmentId) {
            toast.error("Por favor, complete todos los campos requeridos.");
            return;
        }

        const formData: IrrigationCreateData = {
            startDateTime,
            endDateTime,
            waterAmount: parseFloat(waterAmount) || 0,
            irrigationHours: parseFloat(irrigationHours) || 0,
            sectorId: sector.id,
            equipmentId: parseInt(selectedEquipmentId, 10),
        };
        mutation.mutate(formData);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <h3>Registrar Riego para {sector.name}</h3>
                <p><strong>Fecha:</strong> {new Date(date + 'T00:00:00').toLocaleDateString('es-AR', {day: '2-digit', month: '2-digit', year: 'numeric'})}</p>
                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="startTime">Hora Inicio</label>
                            <input type="time" name="startTime" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="irrigationHours">Horas de Riego</label>
                            {/* Corregido: type="text" y inputMode="decimal", se usa el nuevo handler */}
                            <input type="text" inputMode="decimal" step="0.5" name="irrigationHours" value={irrigationHours} onChange={handleNumericChange} required />
                        </div>
                         <div className="form-group">
                            <label htmlFor="equipmentId">Equipo</label>
                            {sector.equipmentId ? (
                                <input type="text" value={sector.equipmentName || `Equipo ID: ${sector.equipmentId}`} disabled />
                            ) : (
                                <select name="equipmentId" value={selectedEquipmentId} onChange={(e) => setSelectedEquipmentId(e.target.value)} required disabled={isLoadingEquipment}>
                                    <option value="">{isLoadingEquipment ? 'Cargando...' : 'Seleccione equipo'}</option>
                                    {allEquipment.map(eq => (
                                        <option key={eq.id} value={eq.id}>{eq.name}</option>
                                    ))}
                                </select>
                            )}
                        </div>
                        <div className="form-group">
                            <label htmlFor="waterAmount">Cantidad de Agua (m³)</label>
                            {/* Corregido: type="text" y inputMode="decimal", se usa el nuevo handler */}
                            <input type="text" inputMode="decimal" step="0.1" name="waterAmount" value={waterAmount} onChange={handleNumericChange} required />
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