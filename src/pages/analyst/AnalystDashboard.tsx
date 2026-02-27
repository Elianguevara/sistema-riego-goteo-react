// Archivo: src/pages/analyst/AnalystDashboard.tsx

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import dashboardService from '../../services/dashboardService';
import farmService from '../../services/farmService';
import type { FarmStatus, WaterBalance, TaskSummary } from '../../types/analyst.types';
import type { Farm } from '../../types/farm.types';
import AnalystDashboardView from './AnalystDashboardView';

const AnalystDashboard = () => {
    const [selectedFarmId, setSelectedFarmId] = useState<number | undefined>();

    const { data: farms = [] } = useQuery<Farm[], Error>({
        queryKey: ['farmsForAnalyst'],
        queryFn: farmService.getFarms,
    });

    useState(() => {
        if (farms.length > 0 && !selectedFarmId) {
            setSelectedFarmId(farms[0].id);
        }
    });

    const { data: taskSummary } = useQuery<TaskSummary, Error>({
        queryKey: ['analystTaskSummary'],
        queryFn: dashboardService.getTaskSummary,
    });

    const { data: farmStatuses } = useQuery<FarmStatus[], Error>({
        queryKey: ['analystFarmStatuses'],
        queryFn: dashboardService.getFarmStatuses,
    });

    const today = new Date();
    const endDate = today.toISOString().split('T')[0];
    const startDate = new Date(new Date().setDate(today.getDate() - 7)).toISOString().split('T')[0];

    const { data: waterBalance } = useQuery<WaterBalance[], Error>({
        queryKey: ['analystWaterBalance', selectedFarmId, startDate, endDate],
        queryFn: () => dashboardService.getWaterBalance(selectedFarmId!, startDate, endDate),
        enabled: !!selectedFarmId,
    });

    const taskDistribution = [
        { name: 'Pendientes', value: taskSummary?.pendingTasks ?? 0, color: '#3b82f6' },
        { name: 'En Progreso', value: taskSummary?.inProgressTasks ?? 0, color: '#f59e0b' },
        { name: 'Completadas', value: taskSummary?.completedTasks ?? 0, color: '#10b981' },
    ];

    const totalTasks = taskSummary?.totalTasks ?? 0;

    const farmsWithCoords = farmStatuses?.filter(f => f.latitude != null && f.longitude != null) || [];

    const mapCenter: [number, number] = farmsWithCoords.length > 0
        ? [farmsWithCoords[0].latitude, farmsWithCoords[0].longitude]
        : [-34.6037, -58.3816];

    return (
        <AnalystDashboardView
            taskSummary={taskSummary}
            taskDistribution={taskDistribution}
            totalTasks={totalTasks}
            waterBalance={waterBalance}
            farms={farms}
            farmsWithCoords={farmsWithCoords}
            mapCenter={mapCenter}
            selectedFarmId={selectedFarmId}
            onFarmChange={setSelectedFarmId}
        />
    );
};

export default AnalystDashboard;
