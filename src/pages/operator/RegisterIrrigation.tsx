// Archivo: src/pages/operator/RegisterIrrigation.tsx

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import farmService from '../../services/farmService';
import irrigationService from '../../services/irrigationService';
import weatherService from '../../services/weatherService';

// 1. Importamos ambos componentes de visualización
import DailyIrrigationView from '../../components/irrigation/DailyIrrigationView';
import IrrigationScheduler from '../../components/irrigation/IrrigationScheduler';

import type { CurrentWeather } from '../../types/weather.types';
import type { Sector } from '../../types/farm.types';
import './RegisterIrrigation.css';
import LoadingState from '../../components/ui/LoadingState';

const RegisterIrrigation = () => {
    const today = new Date();
    const [selectedFarmId, setSelectedFarmId] = useState<number | undefined>();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth() + 1);

    // 2. Nuevo estado para controlar la vista activa ('daily' o 'monthly')
    const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('daily');

    // --- Queries (sin cambios) ---
    const { data: farms = [], isLoading: isLoadingFarms } = useQuery<any[], Error>({
        queryKey: ['myFarms'],
        queryFn: () => farmService.getFarms(),
    });

    useEffect(() => {
        if (isLoadingFarms || selectedFarmId) return;
        if (farms && farms.length === 1) {
            setSelectedFarmId(farms[0].id);
        }
    }, [farms, isLoadingFarms, selectedFarmId]);

    const { data: monthlyData = [], isLoading: isLoadingIrrigations } = useQuery({
        queryKey: ['irrigations', selectedFarmId, year, month],
        queryFn: () => irrigationService.getMonthlyIrrigationView(selectedFarmId!, year, month),
        enabled: !!selectedFarmId,
    });
    
    const { data: sectors = [] } = useQuery<Sector[], Error>({
        queryKey: ['sectors', selectedFarmId],
        queryFn: () => farmService.getSectorsByFarm(selectedFarmId!),
        enabled: !!selectedFarmId,
    });

    const { 
        data: weatherData, 
        isLoading: isLoadingWeather, 
        error: weatherError 
    } = useQuery<CurrentWeather, Error>({
        queryKey: ['weather', selectedFarmId],
        queryFn: () => weatherService.getCurrentWeather(selectedFarmId!),
        enabled: !!selectedFarmId,
        retry: false,
        staleTime: 1000 * 60 * 15,
    });
    // --- Fin de Queries ---

    const handleMonthChange = (offset: number) => {
        const newDate = new Date(year, month - 1 + offset);
        setYear(newDate.getFullYear());
        setMonth(newDate.getMonth() + 1);
    };

    const monthName = new Date(year, month - 1).toLocaleString('es-AR', { month: 'long' });

    const renderContent = () => {
        if (isLoadingFarms) return <LoadingState message="Cargando fincas asignadas..." />;
        if (farms.length === 0) {
            return (
                <div className="empty-state">
                    {/* ... Mensaje de no hay fincas ... */}
                </div>
            );
        }

        const isFarmDataLoading = isLoadingIrrigations || isLoadingWeather;

        return (
            <>
                <div className="filters-bar">
                    {/* ... Selector de Finca ... */}

                    {/* 3. Agregamos los botones para cambiar de vista */}
                    {selectedFarmId && (
                        <div className="view-switcher">
                            <button 
                                className={viewMode === 'daily' ? 'active' : ''} 
                                onClick={() => setViewMode('daily')}
                                title="Vista Diaria"
                            >
                                <i className="fas fa-bars"></i>
                            </button>
                            <button 
                                className={viewMode === 'monthly' ? 'active' : ''} 
                                onClick={() => setViewMode('monthly')}
                                title="Vista Mensual"
                            >
                                <i className="fas fa-calendar-alt"></i>
                            </button>
                        </div>
                    )}

                    {selectedFarmId && (
                        <div className="month-navigator">
                            {/* ... Navegador de mes ... */}
                        </div>
                    )}
                </div>

                {selectedFarmId ? (
                    isFarmDataLoading ? <p>Cargando datos de la finca...</p> :
                    // 4. Renderizado condicional basado en el viewMode
                    (viewMode === 'daily' ? (
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
                        <IrrigationScheduler
                            farmId={selectedFarmId}
                            monthlyData={monthlyData}
                            year={year}
                            month={month}
                        />
                    ))
                ) : (
                     <div className="empty-state">
                        {/* ... Mensaje de seleccionar finca ... */}
                    </div>
                )}
            </>
        );
    }

    return (
        <div className="register-irrigation-page">
            <h1>Registro y Planificador de Riego</h1>
            {renderContent()}
        </div>
    );
};

export default RegisterIrrigation;