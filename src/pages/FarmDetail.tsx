import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import farmService from '../services/farmService';
import adminService from '../services/adminService';
import SectorForm from '../components/farms/SectorForm';
import EquipmentForm from '../components/farms/EquipmentForm';
import WaterSourceForm from '../components/farms/WaterSourceForm';
import AssignUserForm from '../components/farms/AssignUserForm';
// PASO 1: Importar el nuevo ActionsMenu genérico y su tipo
import ActionsMenu, { type ActionMenuItem } from '../components/ui/ActionsMenu';
import fertilizationService from '../services/fertilizationService';
import FertilizationList from '../components/fertilization/FertilizationList';
import FertilizationForm from '../components/fertilization/FertilizationForm';
import type { 
    Farm, 
    Sector, SectorCreateData, SectorUpdateData, 
    IrrigationEquipment, EquipmentCreateData, EquipmentUpdateData,
    WaterSource, WaterSourceCreateData, WaterSourceUpdateData
} from '../types/farm.types';
import type { FertilizationRequest, FertilizationResponse } from '../types/fertilization.types';
import type { UserResponse } from '../types/user.types';
import { useAuthData } from '../hooks/useAuthData';

import './FarmDetail.css';

// El modal de confirmación sigue siendo reutilizable
const ConfirmationModal = ({ message, onConfirm, onCancel, isLoading }: { message: string, onConfirm: () => void, onCancel: () => void, isLoading: boolean }) => (
    <div className="modal-overlay">
        <div className="modal-container">
            <h3>Confirmación Requerida</h3>
            <p>{message}</p>
            <div className="modal-actions">
                <button className="btn-cancel" onClick={onCancel} disabled={isLoading}>Cancelar</button>
                <button className="btn-delete" onClick={onConfirm} disabled={isLoading}>
                    {isLoading ? 'Eliminando...' : 'Confirmar'}
                </button>
            </div>
        </div>
    </div>
);


const FarmDetail = () => {
    const { farmId } = useParams<{ farmId: string }>();
    const queryClient = useQueryClient();
    const { role } = useAuthData() || {};
    const farmIdNum = Number(farmId);

    // --- Permisos para Fertilización ---
    const canCreateFertilization = role === 'ADMIN' || role === 'ANALISTA' || role === 'OPERARIO';
    const canEditFertilization = role === 'ADMIN' || role === 'OPERARIO';
    const canDeleteFertilization = role === 'ADMIN';

    // --- Estados para Modales (sin cambios) ---
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

    // --- Estados para Fertilización ---
    const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
    const [isFertilizationModalOpen, setIsFertilizationModalOpen] = useState(false);
    const [currentFertilization, setCurrentFertilization] = useState<FertilizationResponse | null>(null);
    const [fertilizationToDelete, setFertilizationToDelete] = useState<FertilizationResponse | null>(null);

    // --- Obtención de Datos (sin cambios) ---
    const { data: farm, isLoading: isLoadingFarm, isError, error } = useQuery<Farm, Error>({ queryKey: ['farmDetails', farmId], queryFn: () => farmService.getFarmById(farmIdNum), enabled: !!farmIdNum });
    const { data: sectors = [], isLoading: isLoadingSectors } = useQuery<Sector[], Error>({ queryKey: ['sectors', farmId], queryFn: () => farmService.getSectorsByFarm(farmIdNum), enabled: !!farmIdNum });
    const { data: equipments = [], isLoading: isLoadingEquipments } = useQuery<IrrigationEquipment[], Error>({ queryKey: ['equipments', farmId], queryFn: () => farmService.getEquipmentsByFarm(farmIdNum), enabled: !!farmIdNum });
    const { data: waterSources = [], isLoading: isLoadingWaterSources } = useQuery<WaterSource[], Error>({ queryKey: ['waterSources', farmId], queryFn: () => farmService.getWaterSourcesByFarm(farmIdNum), enabled: !!farmIdNum });
    const { data: assignedUsers = [], isLoading: isLoadingAssignedUsers } = useQuery<UserResponse[], Error>({ queryKey: ['assignedUsers', farmId], queryFn: () => farmService.getAssignedUsers(farmIdNum), enabled: !!farmIdNum });
    const { data: allUsers = [] } = useQuery<UserResponse[], Error>({ queryKey: ['users'], queryFn: adminService.getUsers });

    const { data: fertilizations = [], isLoading: isLoadingFertilizations } = useQuery<FertilizationResponse[], Error>({
        queryKey: ['fertilizations', selectedSector?.id],
        queryFn: () => fertilizationService.getFertilizationsBySector(selectedSector!.id),
        enabled: !!selectedSector, // Solo ejecutar si hay un sector seleccionado
    });

    // --- Mutaciones (sin cambios) ---
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

    // --- Mutaciones para Fertilización ---
    const createFertilizationMutation = useMutation({
        mutationFn: (data: FertilizationRequest) => fertilizationService.createFertilization(data),
        onSuccess: () => {
            toast.success("Registro de fertilización creado.");
            queryClient.invalidateQueries({ queryKey: ['fertilizations', selectedSector?.id] });
            setIsFertilizationModalOpen(false);
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const updateFertilizationMutation = useMutation({
        mutationFn: (data: Partial<FertilizationRequest>) => fertilizationService.updateFertilization(currentFertilization!.id, data),
        onSuccess: () => {
            toast.success("Registro de fertilización actualizado.");
            queryClient.invalidateQueries({ queryKey: ['fertilizations', selectedSector?.id] });
            setIsFertilizationModalOpen(false);
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const deleteFertilizationMutation = useMutation({
        mutationFn: (fertilizationId: number) => fertilizationService.deleteFertilization(fertilizationId),
        onSuccess: () => {
            toast.success("Registro de fertilización eliminado.");
            queryClient.invalidateQueries({ queryKey: ['fertilizations', selectedSector?.id] });
            setFertilizationToDelete(null);
        },
        onError: (err: Error) => toast.error(err.message),
    });

    // --- Manejadores de Eventos (sin cambios) ---
    const handleOpenCreateSectorForm = () => { setCurrentSector(null); setIsSectorModalOpen(true); };
    const handleOpenEditSectorForm = (sector: Sector) => { setCurrentSector(sector); setIsSectorModalOpen(true); };
    const handleSaveSector = (data: SectorCreateData | SectorUpdateData) => { if (currentSector) { updateSectorMutation.mutate(data as SectorUpdateData); } else { createSectorMutation.mutate(data as SectorCreateData); } };
    const handleConfirmDeleteSector = () => { if(sectorToDelete) { deleteSectorMutation.mutate(sectorToDelete.id); } };
    
    const handleOpenCreateEquipmentForm = () => { setCurrentEquipment(null); setIsEquipmentModalOpen(true); };
    const handleOpenEditEquipmentForm = (equipment: IrrigationEquipment) => { setCurrentEquipment(equipment); setIsEquipmentModalOpen(true); };
    const handleSaveEquipment = (data: EquipmentCreateData | EquipmentUpdateData) => { if (currentEquipment) { updateEquipmentMutation.mutate(data as EquipmentUpdateData); } else { createEquipmentMutation.mutate(data as EquipmentCreateData); } };
    const handleConfirmDeleteEquipment = () => { if(equipmentToDelete) { deleteEquipmentMutation.mutate(equipmentToDelete.id); } };

    const handleOpenCreateWaterSourceForm = () => { setCurrentWaterSource(null); setIsWaterSourceModalOpen(true); };
    const handleOpenEditWaterSourceForm = (ws: WaterSource) => { setCurrentWaterSource(ws); setIsWaterSourceModalOpen(true); };
    const handleSaveWaterSource = (data: WaterSourceCreateData | WaterSourceUpdateData) => { if (currentWaterSource) { updateWaterSourceMutation.mutate(data as WaterSourceUpdateData); } else { createWaterSourceMutation.mutate(data as WaterSourceCreateData); } };
    const handleConfirmDeleteWaterSource = () => { if(waterSourceToDelete) { deleteWaterSourceMutation.mutate(waterSourceToDelete.id); } };

    const handleSaveUserAssignment = (userId: number) => { assignUserMutation.mutate(userId); };
    const handleConfirmUnassignUser = () => { if(userToUnassign) { unassignUserMutation.mutate(userToUnassign.id); }};

    // --- Manejadores para Fertilización ---
    const handleSelectSector = (sector: Sector) => {
        setSelectedSector(sector);
    };

    const handleOpenCreateFertilizationForm = () => {
        setCurrentFertilization(null);
        setIsFertilizationModalOpen(true);
    };

    const handleOpenEditFertilizationForm = (fertilization: FertilizationResponse) => {
        setCurrentFertilization(fertilization);
        setIsFertilizationModalOpen(true);
    };

    const handleSaveFertilization = (data: FertilizationRequest | Partial<FertilizationRequest>) => {
        if (currentFertilization) {
            updateFertilizationMutation.mutate(data);
        } else {
            createFertilizationMutation.mutate(data as FertilizationRequest);
        }
    };

    const handleConfirmDeleteFertilization = () => {
        if (fertilizationToDelete) {
            deleteFertilizationMutation.mutate(fertilizationToDelete.id);
        }
    };

    const availableUsersToAssign = useMemo(() => { const assignedUserIds = new Set(assignedUsers.map(u => u.id)); return allUsers.filter(u => !assignedUserIds.has(u.id)); }, [allUsers, assignedUsers]);

    // PASO 2: Definir las acciones para cada tipo de entidad
    const getSectorActions = (sector: Sector): ActionMenuItem[] => ([
        { label: 'Editar', action: () => handleOpenEditSectorForm(sector) },
        { label: 'Eliminar', action: () => setSectorToDelete(sector), className: 'delete' }
    ]);

    const getEquipmentActions = (equipment: IrrigationEquipment): ActionMenuItem[] => ([
        { label: 'Editar', action: () => handleOpenEditEquipmentForm(equipment) },
        { label: 'Eliminar', action: () => setEquipmentToDelete(equipment), className: 'delete' }
    ]);

    const getWaterSourceActions = (ws: WaterSource): ActionMenuItem[] => ([
        { label: 'Editar', action: () => handleOpenEditWaterSourceForm(ws) },
        { label: 'Eliminar', action: () => setWaterSourceToDelete(ws), className: 'delete' }
    ]);

    if (isLoadingFarm) return <div>Cargando...</div>;
    if (isError) return <div className="error-text">Error: {error.message}</div>;

    return (
        <div className="farm-detail-page">
            <div className="detail-header"> <i className="fas fa-seedling header-icon"></i> <div><h1>{farm?.name}</h1><p>{farm?.location}</p></div> </div>

            <div className="detail-grid-main">
                {/* Columna Izquierda con las tarjetas principales */}
                <div className="main-column">
                    <div className="detail-card">
                        <div className="card-header"><h3>Sectores</h3><button className="btn-add" onClick={handleOpenCreateSectorForm}><i className="fas fa-plus"></i> Añadir Sector</button></div>
                        {isLoadingSectors ? <p>Cargando...</p> : (
                            <table className="detail-table selectable">
                                <thead><tr><th>Nombre</th><th>Equipo Asignado</th><th>Acciones</th></tr></thead>
                                <tbody>{sectors.map(s => (
                                    <tr key={s.id} onClick={() => handleSelectSector(s)} className={selectedSector?.id === s.id ? 'selected' : ''}>
                                        <td>{s.name}</td>
                                        <td>{s.equipmentName || 'N/A'}</td>
                                        <td className='actions'><ActionsMenu items={getSectorActions(s)} /></td>
                                    </tr>
                                ))}</tbody>
                            </table>
                        )}
                    </div>
                     <div className="detail-card">
                        <div className="card-header"><h3>Usuarios Asignados</h3><button className="btn-add" onClick={() => setIsAssignUserModalOpen(true)}><i className="fas fa-plus"></i> Asignar Usuario</button></div>
                        {isLoadingAssignedUsers ? <p>Cargando...</p> : (
                            <table className="detail-table">
                                <thead><tr><th>Nombre</th><th>Username</th><th>Rol</th><th>Acciones</th></tr></thead>
                                <tbody>{assignedUsers.map(user => (<tr key={user.id}><td>{user.name}</td><td>{user.username}</td><td>{user.roleName}</td><td><button className='btn-delete-link' onClick={() => setUserToUnassign(user)}>Desasignar</button></td></tr>))}</tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Columna Derecha para detalles del sector y otras tarjetas */}
                <div className="side-column">
                    {selectedSector && (
                        <div className="detail-card">
                            <div className="card-header">
                                <h3>Fertilizaciones de: {selectedSector.name}</h3>
                                {canCreateFertilization && (
                                    <button className="btn-add" onClick={handleOpenCreateFertilizationForm}><i className="fas fa-plus"></i> Añadir Registro</button>
                                )}
                            </div>
                            {isLoadingFertilizations ? <p>Cargando fertilizaciones...</p> : (
                                <FertilizationList
                                    fertilizations={fertilizations}
                                    onEdit={handleOpenEditFertilizationForm}
                                    onDelete={(id) => setFertilizationToDelete(fertilizations.find(f => f.id === id) || null)}
                                    canEdit={canEditFertilization}
                                    canDelete={canDeleteFertilization}
                                />
                            )}
                        </div>
                    )}
                    <div className="detail-card">
                        <div className="card-header"><h3>Equipos de Riego</h3><button className="btn-add" onClick={handleOpenCreateEquipmentForm}><i className="fas fa-plus"></i> Añadir Equipo</button></div>
                        {isLoadingEquipments ? <p>Cargando...</p> : (<table className="detail-table"><thead><tr><th>Nombre</th><th>Tipo</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{equipments.map(eq => (<tr key={eq.id}><td>{eq.name}</td><td>{eq.equipmentType}</td><td>{eq.equipmentStatus}</td><td className='actions'><ActionsMenu items={getEquipmentActions(eq)} /></td></tr>))}</tbody></table>)}
                    </div>
                    <div className="detail-card">
                        <div className="card-header"><h3>Fuentes de Agua</h3><button className="btn-add" onClick={handleOpenCreateWaterSourceForm}><i className="fas fa-plus"></i> Añadir Fuente</button></div>
                        {isLoadingWaterSources ? <p>Cargando...</p> : (<table className="detail-table"><thead><tr><th>Tipo</th><th>Acciones</th></tr></thead><tbody>{waterSources.map(ws => (<tr key={ws.id}><td>{ws.type}</td><td className='actions'><ActionsMenu items={getWaterSourceActions(ws)} /></td></tr>))}</tbody></table>)}
                    </div>
                </div>
            </div>
            
            {/* Modales */}
            {isSectorModalOpen && <SectorForm currentSector={currentSector} availableEquipment={equipments} onSave={handleSaveSector} onCancel={() => setIsSectorModalOpen(false)} isLoading={createSectorMutation.isPending || updateSectorMutation.isPending} />}
            {sectorToDelete && <ConfirmationModal message={`¿Seguro de eliminar el sector "${sectorToDelete.name}"?`} onConfirm={handleConfirmDeleteSector} onCancel={() => setSectorToDelete(null)} isLoading={deleteSectorMutation.isPending} />}
            
            {isEquipmentModalOpen && <EquipmentForm currentEquipment={currentEquipment} onSave={handleSaveEquipment} onCancel={() => setIsEquipmentModalOpen(false)} isLoading={createEquipmentMutation.isPending || updateEquipmentMutation.isPending} />}
            {equipmentToDelete && <ConfirmationModal message={`¿Seguro de eliminar el equipo "${equipmentToDelete.name}"?`} onConfirm={handleConfirmDeleteEquipment} onCancel={() => setEquipmentToDelete(null)} isLoading={deleteEquipmentMutation.isPending} />}
            
            {isWaterSourceModalOpen && <WaterSourceForm currentWaterSource={currentWaterSource} onSave={handleSaveWaterSource} onCancel={() => setIsWaterSourceModalOpen(false)} isLoading={createWaterSourceMutation.isPending || updateWaterSourceMutation.isPending} />}
            {waterSourceToDelete && <ConfirmationModal message={`¿Seguro de eliminar la fuente de agua "${waterSourceToDelete.type}"?`} onConfirm={handleConfirmDeleteWaterSource} onCancel={() => setWaterSourceToDelete(null)} isLoading={deleteWaterSourceMutation.isPending} />}
            
            {isAssignUserModalOpen && <AssignUserForm availableUsers={availableUsersToAssign} onSave={handleSaveUserAssignment} onCancel={() => setIsAssignUserModalOpen(false)} isLoading={assignUserMutation.isPending} />}
            {userToUnassign && <ConfirmationModal message={`¿Seguro de desasignar a "${userToUnassign.name}" de esta finca?`} onConfirm={handleConfirmUnassignUser} onCancel={() => setUserToUnassign(null)} isLoading={unassignUserMutation.isPending} />}

            {isFertilizationModalOpen && selectedSector && (
                <FertilizationForm
                    currentFertilization={currentFertilization}
                    sectorId={selectedSector.id}
                    onSave={handleSaveFertilization}
                    onCancel={() => setIsFertilizationModalOpen(false)}
                    isLoading={createFertilizationMutation.isPending || updateFertilizationMutation.isPending}
                />
            )}
            {fertilizationToDelete && <ConfirmationModal message={`¿Seguro de eliminar este registro de fertilización?`} onConfirm={handleConfirmDeleteFertilization} onCancel={() => setFertilizationToDelete(null)} isLoading={deleteFertilizationMutation.isPending} />}
        </div>
    );
};

export default FarmDetail;
