// src/pages/FarmManagementView.tsx

import type { Farm, FarmCreateData, FarmUpdateData } from '../types/farm.types';
import FarmForm from '../components/farms/FarmForm';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import Modal from '../components/ui/Modal';
import StatCard from '../components/ui/StatCard';
import PageHeader from '../components/ui/PageHeader';
import Badge from '../components/ui/Badge';
import TableToolbar from '../components/ui/TableToolbar';
import EmptyState from '../components/ui/EmptyState';
import { Plus, MapPin, Edit2, Trash2, Search, Grid3x3, Users, TrendingUp, ChevronRight } from 'lucide-react';
import './FarmManagement.css';
import '../components/users/UserForm.css';

interface FarmStats {
    totalFarms: number;
    activeFarms: number;
    totalArea: number;
}

interface FarmManagementViewProps {
    filteredFarms: Farm[];
    stats: FarmStats;
    searchTerm: string;
    viewMode: 'grid' | 'list';
    isFormModalOpen: boolean;
    currentFarm: Farm | null;
    farmToDelete: Farm | null;
    isFormSaving: boolean;
    isDeleting: boolean;
    onSearchChange: (term: string) => void;
    onViewModeChange: (mode: 'grid' | 'list') => void;
    onOpenCreateForm: () => void;
    onOpenEditForm: (farm: Farm) => void;
    onSaveForm: (data: FarmCreateData | FarmUpdateData) => void;
    onCloseFormModal: () => void;
    onOpenDeleteModal: (farm: Farm) => void;
    onCloseDeleteModal: () => void;
    onConfirmDelete: () => void;
    onNavigateToFarm: (farmId: number) => void;
}

const FarmManagementView = ({
    filteredFarms,
    stats,
    searchTerm,
    viewMode,
    isFormModalOpen,
    currentFarm,
    farmToDelete,
    isFormSaving,
    isDeleting,
    onSearchChange,
    onViewModeChange,
    onOpenCreateForm,
    onOpenEditForm,
    onSaveForm,
    onCloseFormModal,
    onOpenDeleteModal,
    onCloseDeleteModal,
    onConfirmDelete,
    onNavigateToFarm,
}: FarmManagementViewProps) => (
    <div className="farm-management-page">
        <PageHeader
            title="Gestión de Fincas"
            subtitle="Administra y supervisa todas tus propiedades agrícolas"
            action={
                <button className="create-farm-button" onClick={onOpenCreateForm}>
                    <Plus className="w-5 h-5" />
                    Crear Finca
                </button>
            }
        />

        <div className="stats-grid">
            <StatCard label="Total de Fincas" value={stats.totalFarms} icon={<MapPin size={24} />} variant="primary" />
            <StatCard label="Fincas Activas" value={stats.activeFarms} icon={<TrendingUp size={24} />} variant="info" />
            <StatCard label="Área Total" value={`${stats.totalArea.toLocaleString()} ha`} icon={<Grid3x3 size={24} />} variant="accent" />
            <StatCard label="Total Usuarios" value="N/A" icon={<Users size={24} />} variant="warning" />
        </div>

        <TableToolbar
            searchValue={searchTerm}
            onSearchChange={onSearchChange}
            searchPlaceholder="Buscar fincas por nombre o ubicación..."
        >
            <div className="view-toggle">
                <button onClick={() => onViewModeChange('grid')} className={`view-button ${viewMode === 'grid' ? 'active' : ''}`}>
                    <Grid3x3 className="w-5 h-5" />
                </button>
                <button onClick={() => onViewModeChange('list')} className={`view-button ${viewMode === 'list' ? 'active' : ''}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>
        </TableToolbar>

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
                                <Badge variant="success" size="md">Activa</Badge>
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
                                <button className="details-button" onClick={() => onNavigateToFarm(farm.id)}>
                                    Ver Detalles <ChevronRight className="w-4 h-4" />
                                </button>
                                <button className="icon-button" onClick={() => onOpenEditForm(farm)}>
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button className="icon-button danger" onClick={() => onOpenDeleteModal(farm)}>
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
                                    <Badge variant="success">Activa</Badge>
                                </div>
                                <div className="farm-list-item-meta">
                                    <span><MapPin className="w-4 h-4" />{farm.location}</span>
                                    <span><Grid3x3 className="w-4 h-4" />{farm.farmSize} ha</span>
                                </div>
                            </div>
                        </div>
                        <div className="farm-list-item-actions">
                            <button className="details-button-list" onClick={() => onNavigateToFarm(farm.id)}>
                                Ver Detalles <ChevronRight className="w-4 h-4" />
                            </button>
                            <button className="icon-button-list" onClick={() => onOpenEditForm(farm)}>
                                <Edit2 className="w-4 h-4" />
                            </button>
                            <button className="icon-button-list danger" onClick={() => onOpenDeleteModal(farm)}>
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

        <Modal isOpen={isFormModalOpen} onClose={onCloseFormModal}>
            <FarmForm
                currentFarm={currentFarm}
                onSave={onSaveForm}
                onCancel={onCloseFormModal}
                isLoading={isFormSaving}
            />
        </Modal>

        {farmToDelete && (
            <ConfirmationModal
                message={`¿Estás seguro de que quieres eliminar la finca "${farmToDelete.name}"?`}
                onConfirm={onConfirmDelete}
                onCancel={onCloseDeleteModal}
                isLoading={isDeleting}
            />
        )}
    </div>
);

export default FarmManagementView;
