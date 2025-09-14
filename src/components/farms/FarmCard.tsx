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

    // 1. Se define un manejador explícito para la navegación.
    // Esto hace que el flujo sea más claro y fácil de depurar.
    const handleNavigateToDetails = (e: React.MouseEvent) => {
        // Se detiene la propagación como medida de seguridad final,
        // aunque no debería ser necesario si el contenedor principal no tiene onClick.
        e.stopPropagation();
        navigate(`/farms/${farm.id}`);
    };

    return (
        // 2. Se confirma que el contenedor principal no tiene ningún evento onClick.
        <div className="farm-card">
            <div className="farm-card-header">
                <div className="farm-card-icon">
                    <i className="fas fa-seedling"></i>
                </div>
                <div className="farm-card-title">
                    <h3>{farm.name}</h3>
                    <p>{farm.location}</p>
                </div>
                
                {/* 3. El menú de acciones sigue deteniendo su propia propagación
                    para no interferir con nada más. */}
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
                {/* 4. El botón "Ver Detalles" ahora usa el manejador explícito. */}
                <button 
                    className="btn-details" 
                    onClick={handleNavigateToDetails}
                >
                    Ver Detalles
                </button>
            </div>
        </div>
    );
};

export default FarmCard;

