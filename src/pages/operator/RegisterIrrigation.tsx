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
    const { data: farms = [], isLoading: isLoadingFarms } = useQuery({
        queryKey: ['myFarms'],
        queryFn: () => farmService.getFarms(),
    });

    // Obtener la vista mensual de riegos para la finca, año y mes seleccionados
    const { data: monthlyData = [], isLoading: isLoadingIrrigations } = useQuery({
        queryKey: ['irrigations', selectedFarmId, year, month],
        queryFn: () => irrigationService.getMonthlyIrrigationView(selectedFarmId!, year, month),
        enabled: !!selectedFarmId,
    });
    
    return (
        <div className="register-irrigation-page">
            <h1>Registro de Riego Mensual</h1>
            <div className="filters-bar">
                <select onChange={(e) => setSelectedFarmId(e.target.value ? Number(e.target.value) : undefined)} disabled={isLoadingFarms}>
                    <option value="">{isLoadingFarms ? "Cargando fincas..." : "Seleccione una finca"}</option>
                    {farms.map(farm => <option key={farm.id} value={farm.id}>{farm.name}</option>)}
                </select>
                {/* Aquí puedes agregar selectores para el año y el mes si lo necesitas */}
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
        </div>
    );
};

export default RegisterIrrigation;
