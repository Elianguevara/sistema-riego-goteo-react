// Archivo: src/pages/operator/RegisterIrrigation.tsx

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import farmService from '../../services/farmService';
import irrigationService from '../../services/irrigationService';
import IrrigationScheduler from '../../components/irrigation/IrrigationScheduler';
import './RegisterIrrigation.css';

const RegisterIrrigation = () => {
    const today = new Date();
    const [selectedFarmId, setSelectedFarmId] = useState<number | undefined>();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth() + 1); // 1-12

    // Obtener las fincas asignadas al usuario actual
    const { data: farms = [], isLoading: isLoadingFarms, isError, error } = useQuery<any[], Error>({
        queryKey: ['myFarms'],
        queryFn: () => farmService.getFarms(),
    });

    // Obtener la vista mensual de riegos (sin cambios en esta parte)
    const { data: monthlyData = [], isLoading: isLoadingIrrigations } = useQuery({
        queryKey: ['irrigations', selectedFarmId, year, month],
        queryFn: () => irrigationService.getMonthlyIrrigationView(selectedFarmId!, year, month),
        enabled: !!selectedFarmId,
    });
    
    // --- INICIO DE LA MODIFICACIÓN ---
    // Renderizado principal con lógica mejorada
    const renderContent = () => {
        // 1. Muestra un mensaje de carga mientras se obtienen las fincas
        if (isLoadingFarms) {
            return <p>Cargando fincas asignadas...</p>;
        }

        // 2. Muestra un mensaje de error si la carga de fincas falla
        if (isError) {
            return <p className="error-text">Error al cargar fincas: {error.message}</p>
        }

        // 3. Muestra un mensaje claro si no hay fincas disponibles para el usuario
        if (farms.length === 0) {
            return (
                <div className="empty-state">
                    <i className="fas fa-seedling empty-icon"></i>
                    <h3>No tienes fincas asignadas</h3>
                    <p>No se encontraron fincas asociadas a tu cuenta. Contacta a un administrador.</p>
                </div>
            );
        }

        // 4. Si hay fincas, muestra el contenido normal (selector y planificador)
        return (
            <>
                <div className="filters-bar">
                    <select onChange={(e) => setSelectedFarmId(e.target.value ? Number(e.target.value) : undefined)}>
                        <option value="">Seleccione una finca</option>
                        {farms.map(farm => <option key={farm.id} value={farm.id}>{farm.name}</option>)}
                    </select>
                </div>

                {selectedFarmId ? (
                    isLoadingIrrigations ? <p>Cargando datos del planificador...</p> :
                    <IrrigationScheduler
                        farmId={selectedFarmId}
                        monthlyData={monthlyData}
                        year={year}
                        month={month}
                    />
                ) : (
                    <div className="empty-state">
                        <i className="fas fa-hand-pointer empty-icon"></i>
                        <h3>Seleccione una Finca</h3>
                        <p>Por favor, elija una finca para ver el planificador de riego.</p>
                    </div>
                )}
            </>
        );
    }
    // --- FIN DE LA MODIFICACIÓN ---

    return (
        <div className="register-irrigation-page">
            <h1>Registro de Riego Mensual</h1>
            {renderContent()}
        </div>
    );
};

export default RegisterIrrigation;