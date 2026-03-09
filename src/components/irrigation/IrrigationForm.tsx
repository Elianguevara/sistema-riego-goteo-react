// Archivo: src/components/irrigation/IrrigationForm.tsx

import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import irrigationService from '../../services/irrigationService';
import farmService from '../../services/farmService';
import type { IrrigationCreateData, IrrigationRecord } from '../../types/irrigation.types';
import type { IrrigationEquipment, Sector } from '../../types/farm.types';
import '../users/UserForm.css';
import Modal from '../ui/Modal';

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
    const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>(sector.equipmentId?.toString() || '');

    // waterAmountInput: lo que se muestra en el campo. Puede ser auto-calculado o manual.
    const [waterAmountInput, setWaterAmountInput] = useState('');
    // isManualWater: true cuando el operario editó el campo manualmente.
    const [isManualWater, setIsManualWater] = useState(false);

    useEffect(() => {
        if (sector.equipmentId) {
            setSelectedEquipmentId(sector.equipmentId.toString());
        }
    }, [sector]);

    // Equipo seleccionado actualmente (con su measuredFlow).
    const selectedEquipment = useMemo<IrrigationEquipment | undefined>(() => {
        if (!selectedEquipmentId) return undefined;
        return allEquipment.find(eq => eq.id === parseInt(selectedEquipmentId, 10));
    }, [allEquipment, selectedEquipmentId]);

    // Cálculo de fechas de inicio y fin.
    const { startDateTime, endDateTime } = useMemo(() => {
        const hours = parseFloat(irrigationHours);
        if (!date || !startTime || !hours || hours <= 0) {
            return { startDateTime: null, endDateTime: null };
        }
        const finalStartDateTime = `${date}T${startTime}:00`;
        const end = new Date(`${date}T${startTime}`);
        end.setTime(end.getTime() + hours * 3600 * 1000);
        const finalEndDateTime =
            end.getFullYear() +
            '-' + String(end.getMonth() + 1).padStart(2, '0') +
            '-' + String(end.getDate()).padStart(2, '0') +
            'T' + String(end.getHours()).padStart(2, '0') +
            ':' + String(end.getMinutes()).padStart(2, '0') +
            ':' + String(end.getSeconds()).padStart(2, '0');
        return { startDateTime: finalStartDateTime, endDateTime: finalEndDateTime };
    }, [date, startTime, irrigationHours]);

    // Volumen teórico: caudal(m³/h) × horas = m³.
    const theoreticalWaterAmount = useMemo<number | null>(() => {
        const hours = parseFloat(irrigationHours);
        if (!selectedEquipment?.measuredFlow || !hours || hours <= 0) return null;
        return Math.round(hours * selectedEquipment.measuredFlow * 100) / 100;
    }, [irrigationHours, selectedEquipment]);

    // Auto-completar el campo cuando cambia equipo o duración, SOLO si el usuario
    // no ha escrito manualmente.
    useEffect(() => {
        if (!isManualWater && theoreticalWaterAmount !== null) {
            setWaterAmountInput(theoreticalWaterAmount.toString());
        }
    }, [theoreticalWaterAmount, isManualWater]);

    const handleIrrigationHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^[0-9]*\.?[0-9]*$/.test(value)) {
            setIrrigationHours(value);
        }
    };

    const handleEquipmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedEquipmentId(e.target.value);
        // Al cambiar de equipo se pierde la base del cálculo → resetear a auto.
        setIsManualWater(false);
    };

    const handleWaterAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^[0-9]*\.?[0-9]*$/.test(value)) {
            setWaterAmountInput(value);
            // Si el valor ingresado difiere del teórico, marcar como manual.
            const parsed = parseFloat(value);
            setIsManualWater(
                theoreticalWaterAmount === null || parsed !== theoreticalWaterAmount
            );
        }
    };

    // Botón para volver al cálculo automático.
    const handleResetToAuto = () => {
        setIsManualWater(false);
        if (theoreticalWaterAmount !== null) {
            setWaterAmountInput(theoreticalWaterAmount.toString());
        }
    };

    const mutation = useMutation<IrrigationRecord, Error, IrrigationCreateData>({
        mutationFn: irrigationService.createIrrigation,
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
            toast.error('Por favor, complete todos los campos requeridos.');
            return;
        }

        const formData: IrrigationCreateData = {
            startDateTime,
            endDateTime,
            irrigationHours: parseFloat(irrigationHours) || 0,
            sectorId: sector.id,
            equipmentId: parseInt(selectedEquipmentId, 10),
            // Si es manual → enviar valor; si es auto → enviar null (el backend calcula).
            waterAmount: isManualWater ? (parseFloat(waterAmountInput) || 0) : null,
        };
        mutation.mutate(formData);
    };

    const waterHint = isManualWater
        ? '✏️ Valor modificado manualmente (Lectura de caudalímetro)'
        : theoreticalWaterAmount !== null
            ? '⚙️ Cálculo teórico automático (caudal m³/h × horas)'
            : 'Seleccione un equipo para calcular automáticamente';

    return (
        <Modal isOpen={true} onClose={onClose}>
            <h3>Registrar Riego para {sector.name}</h3>
            <p><strong>Fecha:</strong> {new Date(date + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
            <form onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="startTime">Hora Inicio</label>
                        <input
                            type="time"
                            id="startTime"
                            name="startTime"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="irrigationHours">Horas de Riego</label>
                        <input
                            type="text"
                            id="irrigationHours"
                            inputMode="decimal"
                            name="irrigationHours"
                            value={irrigationHours}
                            onChange={handleIrrigationHoursChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="equipmentId">Equipo</label>
                        {sector.equipmentId ? (
                            <input
                                type="text"
                                value={sector.equipmentName || `Equipo ID: ${sector.equipmentId}`}
                                disabled
                            />
                        ) : (
                            <select
                                id="equipmentId"
                                name="equipmentId"
                                value={selectedEquipmentId}
                                onChange={handleEquipmentChange}
                                required
                                disabled={isLoadingEquipment}
                            >
                                <option value="">{isLoadingEquipment ? 'Cargando...' : 'Seleccione equipo'}</option>
                                {allEquipment.map(eq => (
                                    <option key={eq.id} value={eq.id}>{eq.name}</option>
                                ))}
                            </select>
                        )}
                    </div>
                    <div className="form-group">
                        <label htmlFor="waterAmount">
                            Cantidad de Agua (m³)
                            {isManualWater && (
                                <button
                                    type="button"
                                    onClick={handleResetToAuto}
                                    style={{ marginLeft: '8px', fontSize: '0.75rem', cursor: 'pointer' }}
                                    title="Volver al cálculo automático"
                                >
                                    Resetear
                                </button>
                            )}
                        </label>
                        <input
                            type="text"
                            id="waterAmount"
                            inputMode="decimal"
                            name="waterAmount"
                            value={waterAmountInput}
                            onChange={handleWaterAmountChange}
                            placeholder="Se calcula al seleccionar equipo y horas"
                        />
                        <small style={{ color: isManualWater ? '#c0392b' : '#27ae60', marginTop: '4px', display: 'block' }}>
                            {waterHint}
                        </small>
                    </div>
                </div>
                <div className="form-group calculated-field">
                    <label>Fecha y Hora de Fin (Calculada)</label>
                    <input
                        type="text"
                        value={endDateTime ? new Date(endDateTime).toLocaleString('es-AR') : ''}
                        disabled
                    />
                </div>
                <div className="modal-actions">
                    <button
                        type="button"
                        className="btn-cancel"
                        onClick={onClose}
                        disabled={mutation.isPending}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="btn-save"
                        disabled={mutation.isPending || !endDateTime || !selectedEquipmentId}
                    >
                        {mutation.isPending ? 'Guardando...' : 'Guardar Riego'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default IrrigationForm;
