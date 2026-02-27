// Archivo: src/components/fertilization/FertilizationList.tsx

import { useQuery } from '@tanstack/react-query';
import fertilizationService from '../../services/fertilizationService';
import type { FertilizationRecord } from '../../types/fertilization.types';
import './FertilizationList.css'; // Crearemos este archivo a continuación
import { FileText } from 'lucide-react';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';

interface Props {
    sectorId: number;
}

const FertilizationList = ({ sectorId }: Props) => {
    const { data: records = [], isLoading, isError, error } = useQuery<FertilizationRecord[], Error>({
        queryKey: ['fertilizationRecords', sectorId],
        queryFn: () => fertilizationService.getFertilizationsBySector(sectorId),
        enabled: !!sectorId,
    });

    if (isLoading) return <LoadingState message="Cargando historial de fertilización..." />;
    if (isError) return <ErrorState message={error.message} />;
    if (records.length === 0) {
        return (
            <EmptyState
                icon={<FileText size={24} />}
                title="No hay registros"
                subtitle="Aún no se han registrado aplicaciones de fertilizante para este sector."
            />
        );
    }

    return (
        <div className="fertilization-list-container">
            <h3>Historial de Aplicaciones</h3>
            <table>
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Tipo de Fertilizante</th>
                        <th>Cantidad</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {records.map(record => (
                        <tr key={record.id}>
                            <td>{new Date(record.date + 'T00:00:00').toLocaleDateString('es-AR')}</td>
                            <td>{record.fertilizerType}</td>
                            <td>{record.quantity} {record.quantityUnit}</td>
                            <td className="actions">
                                {/* Aquí podrías añadir botones para editar o eliminar en el futuro */}
                                <button disabled>Editar</button>
                                <button disabled>Eliminar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default FertilizationList;