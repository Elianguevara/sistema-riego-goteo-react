// src/pages/FarmDetail.tsx

import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Services
import farmService from '../services/farmService';
import adminService from '../services/adminService';
import weatherService from '../services/weatherService';

// Components
import SectorForm from '../components/farms/SectorForm';
import EquipmentForm from '../components/farms/EquipmentForm';
import WaterSourceForm from '../components/farms/WaterSourceForm';
import AssignUserForm from '../components/farms/AssignUserForm';
import ConfirmationModal from '../components/ui/ConfirmationModal';

// Types
import type { Farm, Sector, SectorCreateData, SectorUpdateData, IrrigationEquipment, EquipmentCreateData, EquipmentUpdateData, WaterSource, WaterSourceCreateData, WaterSourceUpdateData } from '../types/farm.types';
import type { UserResponse } from '../types/user.types';
import type { CurrentWeather } from '../types/weather.types';

// Icons
import { Droplets, Wrench, Grid3x3, Users, Plus, Edit2, Trash2, Cloud, CloudRain, Wind, MapPin, Calendar, Activity } from 'lucide-react';

// Styles
import './FarmDetail.css';

const FarmDetail = () => {
    const { farmId } = useParams<{ farmId: string }>();
    const queryClient = useQueryClient();
    const farmIdNum = Number(farmId);

    const [activeTab, setActiveTab] = useState('waterSources');
    
    // Estados para modales
    const [isSectorModalOpen, setIsSectorModalOpen] = useState(false);
    const [currentSector, setCurrentSector] = useState<Sector | null>(null);
    const [sectorToDelete, setSectorToDelete] = useState<Sector | null>(null);
    const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);
    const [currentEquipment, setCurrentEquipment] = useState<IrrigationEquipment | null>(null);
    const [equipmentToDelete, setEquipmentToDelete] = useState<IrrigationEquipment | null>(null);
    const [isWaterSourceModalOpen, setIsWaterSourceModalOpen] = useState(false);
    const [currentWaterSource, setCurrentWaterSource] = useState<WaterSource | null>(null);
    const [waterSourceToDelete, setWaterSourceToDelete] = useState<WaterSource | null>(null);
    const [isAssignUserModalOpen, setIsAssignUserModalOpen] = useState(false);
    const [userToUnassign, setUserToUnassign] = useState<UserResponse | null>(null);

    // --- OBTENCIÓN DE DATOS ---
    const { data: farm, isLoading: isLoadingFarm, isError, error } = useQuery<Farm, Error>({ queryKey: ['farmDetails', farmId], queryFn: () => farmService.getFarmById(farmIdNum), enabled: !!farmIdNum });
    const { data: sectors = [] } = useQuery<Sector[], Error>({ queryKey: ['sectors', farmId], queryFn: () => farmService.getSectorsByFarm(farmIdNum), enabled: !!farmIdNum });
    const { data: equipments = [] } = useQuery<IrrigationEquipment[], Error>({ queryKey: ['equipments', farmId], queryFn: () => farmService.getEquipmentsByFarm(farmIdNum), enabled: !!farmIdNum });
    const { data: waterSources = [] } = useQuery<WaterSource[], Error>({ queryKey: ['waterSources', farmId], queryFn: () => farmService.getWaterSourcesByFarm(farmIdNum), enabled: !!farmIdNum });
    const { data: assignedUsers = [] } = useQuery<UserResponse[], Error>({ queryKey: ['assignedUsers', farmId], queryFn: () => farmService.getAssignedUsers(farmIdNum), enabled: !!farmIdNum });
    const { data: allUsersPage } = useQuery({ queryKey: ['allUsersForAssignment'], queryFn: () => adminService.getUsers({ page: 0, size: 1000 }), });
    const { data: weatherData } = useQuery<CurrentWeather, Error>({ queryKey: ['weather', farmId], queryFn: () => weatherService.getCurrentWeather(farmIdNum), enabled: !!farmIdNum && !!farm?.latitude && !!farm?.longitude, retry: false, });
    
    // --- MUTACIONES ---
    const createSectorMutation = useMutation({ mutationFn: (data: SectorCreateData) => farmService.createSector(farmIdNum, data), onSuccess: () => { toast.success("Sector creado."); queryClient.invalidateQueries({ queryKey: ['sectors', farmId] }); setIsSectorModalOpen(false); }, onError: (err: Error) => toast.error(err.message) });
    const updateSectorMutation = useMutation({ mutationFn: (data: SectorUpdateData) => farmService.updateSector(farmIdNum, currentSector!.id, data), onSuccess: () => { toast.success("Sector actualizado."); queryClient.invalidateQueries({ queryKey: ['sectors', farmId] }); setIsSectorModalOpen(false); }, onError: (err: Error) => toast.error(err.message) });
    const deleteSectorMutation = useMutation({ mutationFn: (sectorId: number) => farmService.deleteSector(farmIdNum, sectorId), onSuccess: () => { toast.success("Sector eliminado."); queryClient.invalidateQueries({ queryKey: ['sectors', farmId] }); setSectorToDelete(null); }, onError: (err: Error) => toast.error(err.message) });
    const createEquipmentMutation = useMutation({ mutationFn: (data: EquipmentCreateData) => farmService.createEquipment(farmIdNum, data), onSuccess: () => { toast.success("Equipo creado."); queryClient.invalidateQueries({ queryKey: ['equipments', farmId] }); setIsEquipmentModalOpen(false); }, onError: (err: Error) => toast.error(err.message) });
    const updateEquipmentMutation = useMutation({ mutationFn: (data: EquipmentUpdateData) => farmService.updateEquipment(farmIdNum, currentEquipment!.id, data), onSuccess: () => { toast.success("Equipo actualizado."); queryClient.invalidateQueries({ queryKey: ['equipments', farmId] }); setIsEquipmentModalOpen(false); }, onError: (err: Error) => toast.error(err.message) });
    const deleteEquipmentMutation = useMutation({ mutationFn: (equipmentId: number) => farmService.deleteEquipment(farmIdNum, equipmentId), onSuccess: () => { toast.success("Equipo eliminado."); queryClient.invalidateQueries({ queryKey: ['equipments', farmId] }); setEquipmentToDelete(null); }, onError: (err: Error) => toast.error(err.message) });
    const createWaterSourceMutation = useMutation({ mutationFn: (data: WaterSourceCreateData) => farmService.createWaterSource(farmIdNum, data), onSuccess: () => { toast.success("Fuente de agua creada."); queryClient.invalidateQueries({ queryKey: ['waterSources', farmId] }); setIsWaterSourceModalOpen(false); }, onError: (err: Error) => toast.error(err.message) });
    const updateWaterSourceMutation = useMutation({ mutationFn: (data: WaterSourceUpdateData) => farmService.updateWaterSource(currentWaterSource!.id, data), onSuccess: () => { toast.success("Fuente de agua actualizada."); queryClient.invalidateQueries({ queryKey: ['waterSources', farmId] }); setIsWaterSourceModalOpen(false); }, onError: (err: Error) => toast.error(err.message) });
    const deleteWaterSourceMutation = useMutation({ mutationFn: (id: number) => farmService.deleteWaterSource(id), onSuccess: () => { toast.success("Fuente de agua eliminada."); queryClient.invalidateQueries({ queryKey: ['waterSources', farmId] }); setWaterSourceToDelete(null); }, onError: (err: Error) => toast.error(err.message) });
    const assignUserMutation = useMutation({ mutationFn: (userId: number) => farmService.assignUserToFarm(userId, farmIdNum), onSuccess: () => { toast.success("Usuario asignado."); queryClient.invalidateQueries({ queryKey: ['assignedUsers', farmId] }); setIsAssignUserModalOpen(false); }, onError: (err: Error) => toast.error(err.message) });
    const unassignUserMutation = useMutation({ mutationFn: (userId: number) => farmService.unassignUserFromFarm(userId, farmIdNum), onSuccess: () => { toast.success("Usuario desasignado."); queryClient.invalidateQueries({ queryKey: ['assignedUsers', farmId] }); setUserToUnassign(null); }, onError: (err: Error) => toast.error(err.message) });

    // --- MANEJADORES DE EVENTOS ---
    const handleOpenCreateSectorForm = () => { setCurrentSector(null); setIsSectorModalOpen(true); };
    const handleOpenEditSectorForm = (sector: Sector) => { setCurrentSector(sector); setIsSectorModalOpen(true); };
    const handleSaveSector = (data: SectorCreateData | SectorUpdateData) => { if (currentSector) { updateSectorMutation.mutate(data as SectorUpdateData); } else { createSectorMutation.mutate(data as SectorCreateData); } };
    const handleOpenCreateEquipmentForm = () => { setCurrentEquipment(null); setIsEquipmentModalOpen(true); };
    const handleOpenEditEquipmentForm = (equipment: IrrigationEquipment) => { setCurrentEquipment(equipment); setIsEquipmentModalOpen(true); };
    const handleSaveEquipment = (data: EquipmentCreateData | EquipmentUpdateData) => { if (currentEquipment) { updateEquipmentMutation.mutate(data as EquipmentUpdateData); } else { createEquipmentMutation.mutate(data as EquipmentCreateData); } };
    const handleOpenCreateWaterSourceForm = () => { setCurrentWaterSource(null); setIsWaterSourceModalOpen(true); };
    const handleOpenEditWaterSourceForm = (ws: WaterSource) => { setCurrentWaterSource(ws); setIsWaterSourceModalOpen(true); };
    const handleSaveWaterSource = (data: WaterSourceCreateData | WaterSourceUpdateData) => { if (currentWaterSource) { updateWaterSourceMutation.mutate(data as WaterSourceUpdateData); } else { createWaterSourceMutation.mutate(data as WaterSourceCreateData); } };
    const handleSaveUserAssignment = (userId: number) => { assignUserMutation.mutate(userId); };
    
    const allUsers = allUsersPage?.content ?? [];
    const availableUsersToAssign = useMemo(() => { const assignedUserIds = new Set(assignedUsers.map(u => u.id)); return allUsers.filter(u => !assignedUserIds.has(u.id)); }, [allUsers, assignedUsers]);
    
    const tabs = [
        { id: 'waterSources', label: 'Fuentes de Agua', icon: <Droplets className="w-4 h-4" />, number: 1, disabled: false },
        { id: 'equipments', label: 'Equipos', icon: <Wrench className="w-4 h-4" />, number: 2, disabled: waterSources.length === 0 },
        { id: 'sectors', label: 'Sectores', icon: <Grid3x3 className="w-4 h-4" />, number: 3, disabled: equipments.length === 0 },
        { id: 'users', label: 'Usuarios', icon: <Users className="w-4 h-4" />, number: 4, disabled: false }
    ];

    const getStatusColor = (status: string) => {
        const colors: { [key: string]: string } = {
            'ACTIVO': 'status-emerald',
            'OPERATIVO': 'status-emerald',
            'MANTENIMIENTO': 'status-amber',
            'INACTIVO': 'status-red'
        };
        return colors[status] || 'status-slate';
    };

    const getEfficiencyColor = (efficiency: number) => {
        if (efficiency >= 90) return 'text-emerald-600';
        if (efficiency >= 80) return 'text-blue-600';
        if (efficiency >= 70) return 'text-amber-600';
        return 'text-red-600';
    };

    if (isLoadingFarm) return <div>Cargando...</div>;
    if (isError) return <div className="error-text">Error: {error.message}</div>;

    return (
        <div className="farm-detail-improved">
            <div className="farm-header-card">
                <div className="farm-header-gradient">
                    <div className="farm-header-content">
                        <div className="farm-header-info">
                            <div className="farm-icon-wrapper">
                                <MapPin className="farm-icon" />
                            </div>
                            <div className="farm-title-group">
                                <h1 className="farm-title">{farm?.name}</h1>
                                <p className="farm-location">
                                    <MapPin className="w-4 h-4" />
                                    {farm?.location}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="farm-stats-grid">
                    <div className="stat-item">
                        <p className="stat-label">Área Total</p>
                        <p className="stat-value">{farm?.farmSize} ha</p>
                    </div>
                    <div className="stat-item">
                        <p className="stat-label">Sectores</p>
                        <p className="stat-value">{sectors.length}</p>
                    </div>
                    <div className="stat-item">
                        <p className="stat-label">Equipos</p>
                        <p className="stat-value">{equipments.length}</p>
                    </div>
                    <div className="stat-item">
                        <p className="stat-label">Usuarios</p>
                        <p className="stat-value">{assignedUsers.length}</p>
                    </div>
                </div>
            </div>

            {weatherData && (
                <div className="weather-widget-card">
                    <div className="weather-widget-content">
                        <div>
                            <div className="weather-title-group">
                                <Cloud className="w-5 h-5" />
                                <span className="weather-title">Condiciones Actuales</span>
                            </div>
                            <div className="weather-temp-group">
                                <span className="weather-temp-value">{Math.round(weatherData.main.temp)}°</span>
                                <span className="weather-temp-unit">C</span>
                            </div>
                            <p className="weather-description">{weatherData.weather[0].description}</p>
                        </div>
                        <div className="weather-details-group">
                            <div className="weather-detail-item">
                                <CloudRain className="w-5 h-5" />
                                <div>
                                    <p className="weather-detail-label">Humedad</p>
                                    <p className="weather-detail-value">{weatherData.main.humidity}%</p>
                                </div>
                            </div>
                            <div className="weather-detail-item">
                                <Wind className="w-5 h-5" />
                                <div>
                                    <p className="weather-detail-label">Viento</p>
                                    <p className="weather-detail-value">{weatherData.wind.speed.toFixed(1)} km/h</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="tabs-container">
                <div className="tabs-nav">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => !tab.disabled && setActiveTab(tab.id)}
                            disabled={tab.disabled}
                            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                        >
                            <span className={`tab-number ${activeTab === tab.id ? 'active' : ''} ${tab.disabled ? 'disabled' : ''}`}>
                                {tab.number}
                            </span>
                            {tab.icon}
                            <span>{tab.label}</span>
                            {activeTab === tab.id && <div className="active-tab-indicator"></div>}
                        </button>
                    ))}
                </div>

                <div className="tab-content">
                    {activeTab === 'waterSources' && (
                        <div>
                            <div className="tab-header">
                                <div>
                                    <h2 className="tab-title">Fuentes de Agua</h2>
                                    <p className="tab-subtitle">Gestiona las fuentes hídricas de la finca</p>
                                </div>
                                <button className="add-button" onClick={handleOpenCreateWaterSourceForm}>
                                    <Plus className="w-5 h-5" /> Añadir Fuente
                                </button>
                            </div>
                            <div className="list-container">
                                {waterSources.map((source) => (
                                    <div key={source.id} className="list-item">
                                        <div className="list-item-content">
                                            <div className="list-item-icon-wrapper blue">
                                                <Droplets className="list-item-icon blue" />
                                            </div>
                                            <div className="list-item-details">
                                                <h3 className="list-item-title">{source.type}</h3>
                                                <div className="list-item-meta">
                                                    <span className={`status-badge ${getStatusColor('ACTIVO')}`}>Activo</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="list-item-actions">
                                            <button className="action-button" onClick={() => handleOpenEditWaterSourceForm(source)}><Edit2 className="w-4 h-4" /></button>
                                            <button className="action-button danger" onClick={() => setWaterSourceToDelete(source)}><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {activeTab === 'equipments' && (
                         <div>
                            <div className="tab-header">
                                <div>
                                    <h2 className="tab-title">Equipos de Riego</h2>
                                    <p className="tab-subtitle">Administra los equipos de irrigación</p>
                                </div>
                                <button className="add-button" onClick={handleOpenCreateEquipmentForm}>
                                    <Plus className="w-5 h-5" /> Añadir Equipo
                                </button>
                            </div>
                            <div className="list-container">
                                {equipments.map((equipment) => (
                                    <div key={equipment.id} className="list-item">
                                        <div className="list-item-content">
                                            <div className="list-item-icon-wrapper purple">
                                                <Wrench className="list-item-icon purple" />
                                            </div>
                                            <div className="list-item-details">
                                                <h3 className="list-item-title">{equipment.name}</h3>
                                                <div className="list-item-meta">
                                                    <span>Tipo: {equipment.equipmentType}</span>
                                                    <span className={`status-badge ${getStatusColor(equipment.equipmentStatus)}`}>{equipment.equipmentStatus}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="list-item-actions wide">
                                            <div className="efficiency-display">
                                                <p className="efficiency-label">Flujo Medido</p>
                                                <p className={`efficiency-value ${getEfficiencyColor(equipment.measuredFlow)}`}>
                                                    {equipment.measuredFlow}
                                                </p>
                                            </div>
                                            <div className="action-buttons-group">
                                                <button className="action-button" onClick={() => handleOpenEditEquipmentForm(equipment)}><Edit2 className="w-4 h-4" /></button>
                                                <button className="action-button danger" onClick={() => setEquipmentToDelete(equipment)}><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'sectors' && (
                         <div>
                            <div className="tab-header">
                                <div>
                                    <h2 className="tab-title">Sectores de Producción</h2>
                                    <p className="tab-subtitle">Organiza las áreas de cultivo</p>
                                </div>
                                <button className="add-button" onClick={handleOpenCreateSectorForm}>
                                    <Plus className="w-5 h-5" /> Añadir Sector
                                </button>
                            </div>
                            <div className="list-container">
                                {sectors.map((sector) => (
                                    <div key={sector.id} className="list-item">
                                        <div className="list-item-content">
                                            <div className="list-item-icon-wrapper teal">
                                                <Grid3x3 className="list-item-icon" />
                                            </div>
                                            <div className="list-item-details">
                                                <h3 className="list-item-title">{sector.name}</h3>
                                                <div className="list-item-meta">
                                                    <span className="meta-item"><Activity className="w-4 h-4" />{sector.equipmentName || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="list-item-actions">
                                            <button className="action-button" onClick={() => handleOpenEditSectorForm(sector)}><Edit2 className="w-4 h-4" /></button>
                                            <button className="action-button danger" onClick={() => setSectorToDelete(sector)}><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div>
                             <div className="tab-header">
                                <div>
                                    <h2 className="tab-title">Usuarios Asignados</h2>
                                    <p className="tab-subtitle">Personal con acceso a esta finca</p>
                                </div>
                                <button className="add-button" onClick={() => setIsAssignUserModalOpen(true)}>
                                    <Plus className="w-5 h-5" /> Asignar Usuario
                                </button>
                            </div>
                            <div className="list-container">
                                {assignedUsers.map((user) => (
                                    <div key={user.id} className="list-item">
                                        <div className="list-item-content">
                                             <div className="user-avatar">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="list-item-title">{user.name}</h3>
                                                <div className="list-item-meta">
                                                    <span className="username-text">@{user.username}</span>
                                                    <span className="role-badge">{user.roleName}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="list-item-actions">
                                            <div className="last-activity-display">
                                                <p className="last-activity-label">Última actividad</p>
                                                <p className="last-activity-value">
                                                    <Calendar className="w-4 h-4" />
                                                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}
                                                </p>
                                            </div>
                                            <button className="unassign-button" onClick={() => setUserToUnassign(user)}>
                                                Desasignar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* --- MODALES --- */}
            {isWaterSourceModalOpen && <WaterSourceForm currentWaterSource={currentWaterSource} onSave={handleSaveWaterSource} onCancel={() => setIsWaterSourceModalOpen(false)} isLoading={createWaterSourceMutation.isPending || updateWaterSourceMutation.isPending} />}
            {waterSourceToDelete && <ConfirmationModal message={`¿Seguro de eliminar la fuente de agua "${waterSourceToDelete.type}"?`} onConfirm={() => deleteWaterSourceMutation.mutate(waterSourceToDelete.id)} onCancel={() => setWaterSourceToDelete(null)} isLoading={deleteWaterSourceMutation.isPending} />}
            
            {isEquipmentModalOpen && <EquipmentForm currentEquipment={currentEquipment} onSave={handleSaveEquipment} onCancel={() => setIsEquipmentModalOpen(false)} isLoading={createEquipmentMutation.isPending || updateEquipmentMutation.isPending} />}
            {equipmentToDelete && <ConfirmationModal message={`¿Seguro de eliminar el equipo "${equipmentToDelete.name}"?`} onConfirm={() => deleteEquipmentMutation.mutate(equipmentToDelete.id)} onCancel={() => setEquipmentToDelete(null)} isLoading={deleteEquipmentMutation.isPending} />}

            {isSectorModalOpen && <SectorForm currentSector={currentSector} availableEquipment={equipments} onSave={handleSaveSector} onCancel={() => setIsSectorModalOpen(false)} isLoading={createSectorMutation.isPending || updateSectorMutation.isPending} />}
            {sectorToDelete && <ConfirmationModal message={`¿Seguro de eliminar el sector "${sectorToDelete.name}"?`} onConfirm={() => deleteSectorMutation.mutate(sectorToDelete.id)} onCancel={() => setSectorToDelete(null)} isLoading={deleteSectorMutation.isPending} />}

            {isAssignUserModalOpen && <AssignUserForm availableUsers={availableUsersToAssign} onSave={handleSaveUserAssignment} onCancel={() => setIsAssignUserModalOpen(false)} isLoading={assignUserMutation.isPending} />}
            {userToUnassign && <ConfirmationModal message={`¿Seguro de desasignar a "${userToUnassign.name}" de esta finca?`} onConfirm={() => unassignUserMutation.mutate(userToUnassign.id)} onCancel={() => setUserToUnassign(null)} isLoading={unassignUserMutation.isPending} />}

        </div>
    );
};

export default FarmDetail;