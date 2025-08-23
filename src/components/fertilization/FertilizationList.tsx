import React from 'react';
import type { FertilizationResponse } from '../../types/fertilization.types';
import './FertilizationList.css';

interface FertilizationListProps {
    fertilizations: FertilizationResponse[];
    onEdit: (fertilization: FertilizationResponse) => void;
    onDelete: (fertilizationId: number) => void;
    canEdit: boolean;
    canDelete: boolean;
}

const FertilizationList: React.FC<FertilizationListProps> = ({ fertilizations, onEdit, onDelete, canEdit, canDelete }) => {

    if (fertilizations.length === 0) {
        return <p>No hay registros de fertilización para este sector.</p>;
    }

    const formatDate = (dateString: string) => {
        // Asegurarse de que la fecha se interpreta correctamente como UTC
        const date = new Date(dateString);
        const userTimezoneOffset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="list-container">
            <h4>Historial de Fertilizaciones</h4>
            <table className="fertilization-table">
                <thead>
                    <tr>
                        <th>Tipo de Fertilizante</th>
                        <th>Fecha de Aplicación</th>
                        <th>Cantidad</th>
                        <th>Unidad</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {fertilizations.map((fert) => (
                        <tr key={fert.id}>
                            <td>{fert.fertilizerType}</td>
                            <td>{formatDate(fert.applicationDate)}</td>
                            <td>{fert.quantity}</td>
                            <td>{fert.unit}</td>
                            <td>
                                <div className="action-buttons">
                                    {canEdit && (
                                        <button className="btn-edit" onClick={() => onEdit(fert)} title="Editar">
                                            <i className="fas fa-edit"></i>
                                        </button>
                                    )}
                                    {canDelete && (
                                        <button className="btn-delete" onClick={() => onDelete(fert.id)} title="Eliminar">
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default FertilizationList;
