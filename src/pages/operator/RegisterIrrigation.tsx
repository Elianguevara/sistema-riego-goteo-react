// Archivo: src/pages/operator/RegisterIrrigation.tsx

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import farmService from '../../services/farmService';
import irrigationService from '../../services/irrigationService';
import weatherService from '../../services/weatherService'; // <-- 1. IMPORTAR SERVICIO DE CLIMA
import DailyIrrigationView from '../../components/irrigation/DailyIrrigationView';
import type { CurrentWeather } from '../../types/weather.types'; // <-- 2. IMPORTAR TIPO DE CLIMA
import './RegisterIrrigation.css';

const RegisterIrrigation = () => {
    const today = new Date();
    const [selectedFarmId, setSelectedFarmId] = useState<number | undefined>();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth() + 1);

    const { data: farms = [], isLoading: isLoadingFarms } = useQuery<any[], Error>({
        queryKey: ['myFarms'],
        queryFn: () => farmService.getFarms(),
    });

    const { data: monthlyData = [], isLoading: isLoadingIrrigations } = useQuery({
        queryKey: ['irrigations', selectedFarmId, year, month],
        queryFn: () => irrigationService.getMonthlyIrrigationView(selectedFarmId!, year, month),
        enabled: !!selectedFarmId,
    });
    
    const { data: sectors = [], isLoading: isLoadingSectors } = useQuery({
        queryKey: ['sectors', selectedFarmId],
        queryFn: () => farmService.getSectorsByFarm(selectedFarmId!),
        enabled: !!selectedFarmId,
    });

    // --- 3. NUEVA QUERY PARA OBTENER EL CLIMA ACTUAL ---
    const { 
        data: weatherData, 
        isLoading: isLoadingWeather, 
        error: weatherError 
    } = useQuery<CurrentWeather, Error>({
        queryKey: ['weather', selectedFarmId],
        queryFn: () => weatherService.getCurrentWeather(selectedFarmId!),
        enabled: !!selectedFarmId, // Solo se ejecuta si hay una finca seleccionada
        retry: false, // No reintentar en caso de error (ej. 409)
        staleTime: 1000 * 60 * 15, // Considerar los datos frescos por 15 minutos
    });

    const handleMonthChange = (offset: number) => {
        const newDate = new Date(year, month - 1 + offset);
        setYear(newDate.getFullYear());
        setMonth(newDate.getMonth() + 1);
    };

    const monthName = new Date(year, month - 1).toLocaleString('es-AR', { month: 'long' });

    const renderContent = () => {
        if (isLoadingFarms) {
            return <p>Cargando fincas asignadas...</p>;
        }
        if (farms.length === 0) {
            return (
                <div className="empty-state">
                    <i className="fas fa-seedling empty-icon"></i>
                    <h3>No tienes fincas asignadas</h3>
                    <p>Contacta a un administrador para que te asigne a una finca.</p>
                </div>
            );
        }

        return (
            <>
                <div className="filters-bar">
                    <select onChange={(e) => setSelectedFarmId(e.target.value ? Number(e.target.value) : undefined)} value={selectedFarmId || ''}>
                        <option value="">Seleccione una finca</option>
                        {farms.map(farm => <option key={farm.id} value={farm.id}>{farm.name}</option>)}
                    </select>

                    {selectedFarmId && (
                        <div className="month-navigator">
                            <button onClick={() => handleMonthChange(-1)}>&lt;</button>
                            <span className="month-display">{monthName.charAt(0).toUpperCase() + monthName.slice(1)} {year}</span>
                            <button onClick={() => handleMonthChange(1)}>&gt;</button>
                        </div>
                    )}
                </div>

                {selectedFarmId ? (
                    (isLoadingIrrigations || isLoadingSectors) ? <p>Cargando datos de riego...</p> :
                    // --- 4. PASAR DATOS DEL CLIMA AL COMPONENTE HIJO ---
                    <DailyIrrigationView
                        farmId={selectedFarmId}
                        sectors={sectors}
                        monthlyData={monthlyData}
                        year={year}
                        month={month}
                        weatherData={weatherData}
                        isLoadingWeather={isLoadingWeather}
                        weatherError={weatherError}
                    />
                ) : (
                    <div className="empty-state">
                        <i className="fas fa-hand-pointer empty-icon"></i>
                        <h3>Seleccione una Finca</h3>
                        <p>Por favor, elija una finca para ver y registrar los riegos y precipitaciones.</p>
                    </div>
                )}
            </>
        );
    }

    return (
        <div className="register-irrigation-page">
            <h1>Historial y Registro de Agua</h1>
            {renderContent()}
        </div>
    );
};

export default RegisterIrrigation;