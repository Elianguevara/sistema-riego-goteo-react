// src/components/farms/FarmCard.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Farm } from '../../types/farm.types';
import ActionsMenu, { type ActionMenuItem } from '../ui/ActionsMenu';
import './FarmCard.css';

interface FarmCardProps {
    farm: Farm;
    actions: ActionMenuItem[];
}

const FarmCard: React.FC<FarmCardProps> = ({ farm, actions }) => {
    const navigate = useNavigate();

    return (
        <div className="farm-card" onClick={() => navigate(`/farms/${farm.id}`)}>
            <div className="farm-card-header">
                <div className="farm-card-icon">
                    <i className="fas fa-seedling"></i>
                </div>
                <div className="farm-card-title">
                    <h3>{farm.name}</h3>
                    <p>{farm.location}</p>
                </div>
                <div className="farm-card-actions" onClick={(e) => e.stopPropagation()}>
                    <ActionsMenu items={actions} />
                </div>
            </div>
            <div className="farm-card-body">
                <div className="kpi-grid">
                    <div className="kpi-item">
                        <span className="kpi-value">{farm.farmSize.toLocaleString('es-AR')}</span>
                        <span className="kpi-label">Hectáreas</span>
                    </div>
                    <div className="kpi-item">
                        <span className="kpi-value">{farm.reservoirCapacity.toLocaleString('es-AR')}</span>
                        <span className="kpi-label">Litros en Reserva</span>
                    </div>
                </div>
            </div>
            <div className="farm-card-footer">
                {/* --- INICIO DE LA CORRECCIÓN --- */}
                <button 
                    className="btn-details" 
                    onClick={(e) => { 
                        // Esta línea detiene el evento y evita que se propague a la tarjeta.
                        e.stopPropagation(); 
                        navigate(`/farms/${farm.id}`); 
                    }}
                >
                    Ver Detalles
                </button>
                {/* --- FIN DE LA CORRECCIÓN --- */}
            </div>
        </div>
    );
};

export default FarmCard;