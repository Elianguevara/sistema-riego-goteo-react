// Archivo: src/components/precipitation/PrecipitationList.tsx

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Trash2, Calendar, Droplets, Loader2 } from 'lucide-react';
import precipitationService from '../../services/precipitationService';
import type { PrecipitationRecord } from '../../types/precipitation.types';
import './PrecipitationList.css';

interface Props {
    farmId: number;
}

const PrecipitationList = ({ farmId }: Props) => {
    const queryClient = useQueryClient();

    const { data: precipitations = [], isLoading, isError } = useQuery<PrecipitationRecord[], Error>({
        queryKey: ['precipitationHistory', farmId],
        queryFn: () => precipitationService.getPrecipitationsByFarm(farmId),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => precipitationService.deletePrecipitation(id),
        onSuccess: () => {
            toast.success('Registro eliminado correctamente.');
            queryClient.invalidateQueries({ queryKey: ['precipitationHistory', farmId] });
            queryClient.invalidateQueries({ queryKey: ['irrigations'] });
        },
        onError: (err: Error) => {
            toast.error(`Error al eliminar: ${err.message}`);
        }
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-8">
                <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="text-center p-4 text-red-500">
                No se pudo cargar el historial de precipitaciones.
            </div>
        );
    }

    return (
        <div className="precipitation-list-container">
            <h4 className="list-title">Historial de Precipitaciones</h4>
            {precipitations.length === 0 ? (
                <p className="no-data">No hay registros para esta finca.</p>
            ) : (
                <div className="table-responsive">
                    <table className="precipitation-table">
                        <thead>
                            <tr>
                                <th><Calendar size={16} /> Fecha</th>
                                <th><Droplets size={16} /> Lluvia (mm)</th>
                                <th className="text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {precipitations.map((item) => (
                                <tr key={item.id}>
                                    <td>{new Date(item.precipitationDate + 'T00:00:00').toLocaleDateString()}</td>
                                    <td>{item.mmRain.toFixed(1)} mm</td>
                                    <td className="text-right">
                                        <button
                                            onClick={() => {
                                                if (window.confirm('¿Está seguro de eliminar este registro?')) {
                                                    deleteMutation.mutate(item.id);
                                                }
                                            }}
                                            className="btn-delete"
                                            title="Eliminar registro"
                                            disabled={deleteMutation.isPending}
                                        >
                                            {deleteMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default PrecipitationList;
