// src/pages/FarmManagement.tsx

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Services
// --- 1. CORRECCIÓN DE LA IMPORTACIÓN ---
// Se importa el objeto completo "farmService" en lugar de una función individual.
import farmService from '../services/farmService'; 

// Types
import type { Farm, FarmCreateData, FarmUpdateData } from '../types/farm.types';

// Components
import FarmForm from '../components/farms/FarmForm';
import ConfirmationModal from '../components/ui/ConfirmationModal';

// Icons
// --- 2. CORRECCIÓN DE ICONOS ---
// Se elimina "Droplets" que no se usaba y se asegura que el resto sí.
import { Plus, MapPin, Edit2, Trash2, Search, Grid3x3, Users, TrendingUp, ChevronRight } from 'lucide-react';

// Styles
import './FarmManagement.css';
import '../components/users/UserForm.css';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';

const FarmManagement = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    // Estados para la UI
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    
    // Estados para los modales
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [currentFarm, setCurrentFarm] = useState<Farm | null>(null);
    const [farmToDelete, setFarmToDelete] = useState<Farm | null>(null);

    // Obtención de datos con React Query
    const { data: farms = [], isLoading, isError, error } = useQuery<Farm[], Error>({
        queryKey: ['farms'],
        // --- 3. CORRECCIÓN DE LA LLAMADA A LA FUNCIÓN ---
        // Ahora se llama a la función como un método del objeto importado.
        queryFn: farmService.getFarms,
    });

    // Mutaciones para CUD (Crear, Actualizar, Eliminar)
    const createFarmMutation = useMutation({
        mutationFn: farmService.createFarm,
        onSuccess: () => {
            toast.success('Finca creada exitosamente.');
            queryClient.invalidateQueries({ queryKey: ['farms'] });
            setIsFormModalOpen(false);
        },
        onError: (err: Error) => toast.error(err.message || 'Error al crear la finca.'),
    });

    const updateFarmMutation = useMutation({
        mutationFn: (variables: { id: number; data: FarmUpdateData }) => farmService.updateFarm(variables.id, variables.data),
        onSuccess: () => {
            toast.success('Finca actualizada exitosamente.');
            queryClient.invalidateQueries({ queryKey: ['farms'] });
            setIsFormModalOpen(false);
        },
        onError: (err: Error) => toast.error(err.message || 'Error al actualizar la finca.'),
    });

    const deleteFarmMutation = useMutation({
        mutationFn: farmService.deleteFarm,
        onSuccess: () => {
            toast.success('Finca eliminada exitosamente.');
            queryClient.invalidateQueries({ queryKey: ['farms'] });
            setFarmToDelete(null);
        },
        onError: (err: Error) => toast.error(err.message || 'Error al eliminar la finca.'),
    });

    // Manejadores de eventos
    const handleOpenCreateForm = () => {
        setCurrentFarm(null);
        setIsFormModalOpen(true);
    };

    const handleOpenEditForm = (farm: Farm) => {
        setCurrentFarm(farm);
        setIsFormModalOpen(true);
    };

    const handleSaveForm = (data: FarmCreateData | FarmUpdateData) => {
        if (currentFarm) {
            updateFarmMutation.mutate({ id: currentFarm.id, data: data as FarmUpdateData });
        } else {
            createFarmMutation.mutate(data as FarmCreateData);
        }
    };

    const handleConfirmDelete = () => {
        if (farmToDelete) {
            deleteFarmMutation.mutate(farmToDelete.id);
        }
    };

    // Filtrado y estadísticas
    const filteredFarms = useMemo(() => farms.filter(farm =>
        farm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farm.location.toLowerCase().includes(searchTerm.toLowerCase())
    ), [farms, searchTerm]);

    const stats = useMemo(() => ({
        totalFarms: farms.length,
        activeFarms: farms.length,
        totalArea: farms.reduce((sum, f) => sum + f.farmSize, 0),
    }), [farms]);

    if (isLoading) return <LoadingState message="Cargando fincas..." />;
    if (isError) return <ErrorState message={error.message} />;

    return (
        <div className="farm-management-page">
            <div className="page-header">
                <div>
                    <h1 className="header-title">Gestión de Fincas</h1>
                    <p className="header-subtitle">Administra y supervisa todas tus propiedades agrícolas</p>
                </div>
                <button className="create-farm-button" onClick={handleOpenCreateForm}>
                    <Plus className="w-5 h-5" />
                    Crear Finca
                </button>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-card-info">
                        <p className="stat-card-label">Total de Fincas</p>
                        <p className="stat-card-value">{stats.totalFarms}</p>
                    </div>
                    <div className="stat-card-icon from-emerald-500 to-teal-500">
                        <MapPin className="w-6 h-6 text-white" />
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-info">
                        <p className="stat-card-label">Fincas Activas</p>
                        <p className="stat-card-value text-emerald-600">{stats.activeFarms}</p>
                    </div>
                     <div className="stat-card-icon from-blue-500 to-cyan-500">
                        <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                </div>
                 <div className="stat-card">
                    <div className="stat-card-info">
                        <p className="stat-card-label">Área Total</p>
                        <p className="stat-card-value">{stats.totalArea.toLocaleString()} ha</p>
                    </div>
                     <div className="stat-card-icon from-purple-500 to-pink-500">
                        <Grid3x3 className="w-6 h-6 text-white" />
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-info">
                        <p className="stat-card-label">Total Usuarios</p>
                        <p className="stat-card-value">N/A</p>
                    </div>
                     <div className="stat-card-icon from-amber-500 to-orange-500">
                        <Users className="w-6 h-6 text-white" />
                    </div>
                </div>
            </div>

            <div className="filters-bar">
                <div className="search-wrapper">
                    <Search className="search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar fincas por nombre o ubicación..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
                <div className="view-toggle">
                    <button onClick={() => setViewMode('grid')} className={`view-button ${viewMode === 'grid' ? 'active' : ''}`}>
                        <Grid3x3 className="w-5 h-5" />
                    </button>
                    <button onClick={() => setViewMode('list')} className={`view-button ${viewMode === 'list' ? 'active' : ''}`}>
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </div>

            {viewMode === 'grid' ? (
                <div className="farms-grid-view">
                    {filteredFarms.map((farm) => (
                        <div key={farm.id} className="farm-card-item">
                            <div className="farm-card-header">
                                <div className="farm-card-header-overlay"></div>
                                <div className="farm-card-header-content">
                                    <div>
                                        <h3 className="farm-card-title">{farm.name}</h3>
                                        <p className="farm-card-location"><MapPin className="w-4 h-4" />{farm.location}</p>
                                    </div>
                                    <span className="status-badge-card status-active">Activa</span>
                                </div>
                            </div>
                            <div className="farm-card-body">
                                <div className="farm-card-stats">
                                    <div>
                                        <p className="stat-label-card">Área</p>
                                        <p className="stat-value-card">{farm.farmSize} ha</p>
                                    </div>
                                </div>
                                <div className="farm-card-actions">
                                    <button className="details-button" onClick={() => navigate(`/farms/${farm.id}`)}>
                                        Ver Detalles <ChevronRight className="w-4 h-4" />
                                    </button>
                                    <button className="icon-button" onClick={() => handleOpenEditForm(farm)}>
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button className="icon-button danger" onClick={() => setFarmToDelete(farm)}>
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="farms-list-view">
                    {filteredFarms.map((farm) => (
                        <div key={farm.id} className="farm-list-item">
                            <div className="farm-list-item-info">
                                <div className="farm-list-item-avatar">{farm.name.charAt(0)}</div>
                                <div>
                                    <div className="farm-list-item-header">
                                        <h3 className="farm-list-item-title">{farm.name}</h3>
                                        <span className="status-badge-list status-active">Activa</span>
                                    </div>
                                    <div className="farm-list-item-meta">
                                        <span><MapPin className="w-4 h-4" />{farm.location}</span>
                                        <span><Grid3x3 className="w-4 h-4" />{farm.farmSize} ha</span>
                                    </div>
                                </div>
                            </div>
                            <div className="farm-list-item-actions">
                                <button className="details-button-list" onClick={() => navigate(`/farms/${farm.id}`)}>
                                    Ver Detalles <ChevronRight className="w-4 h-4" />
                                </button>
                                <button className="icon-button-list" onClick={() => handleOpenEditForm(farm)}>
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                 <button className="icon-button-list danger" onClick={() => setFarmToDelete(farm)}>
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {filteredFarms.length === 0 && (
                <EmptyState
                    icon={<Search size={24} />}
                    title="No se encontraron fincas"
                    subtitle="Intenta con otros términos de búsqueda"
                />
            )}

            {isFormModalOpen && (
                 <div className="modal-overlay">
                    <div className="modal-container">
                        <FarmForm
                            currentFarm={currentFarm}
                            onSave={handleSaveForm}
                            onCancel={() => setIsFormModalOpen(false)}
                            isLoading={createFarmMutation.isPending || updateFarmMutation.isPending}
                        />
                    </div>
                </div>
            )}

            {farmToDelete && (
                <ConfirmationModal
                    message={`¿Estás seguro de que quieres eliminar la finca "${farmToDelete.name}"?`}
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setFarmToDelete(null)}
                    isLoading={deleteFarmMutation.isPending}
                />
            )}
        </div>
    );
};

export default FarmManagement;