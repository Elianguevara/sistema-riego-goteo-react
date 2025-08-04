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
import UserActionsMenu from '../components/users/UserActionsMenu';
import type { 
    Farm, 
    Sector, SectorCreateData, SectorUpdateData, 
    IrrigationEquipment, EquipmentCreateData, EquipmentUpdateData,
    WaterSource, WaterSourceCreateData, WaterSourceUpdateData
} from '../types/farm.types';
import type { UserResponse } from '../types/user.types';

import './FarmDetail.css';

// Reutilizamos el modal de confirmación
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
    const farmIdNum = Number(farmId);

    // --- Estados para Modales ---
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

    // --- Obtención de Datos ---
    const { data: farm, isLoading: isLoadingFarm, isError, error } = useQuery<Farm, Error>({ queryKey: ['farmDetails', farmId], queryFn: () => farmService.getFarmById(farmIdNum), enabled: !!farmIdNum });
    const { data: sectors = [], isLoading: isLoadingSectors } = useQuery<Sector[], Error>({ queryKey: ['sectors', farmId], queryFn: () => farmService.getSectorsByFarm(farmIdNum), enabled: !!farmIdNum });
    const { data: equipments = [], isLoading: isLoadingEquipments } = useQuery<IrrigationEquipment[], Error>({ queryKey: ['equipments', farmId], queryFn: () => farmService.getEquipmentsByFarm(farmIdNum), enabled: !!farmIdNum });
    const { data: waterSources = [], isLoading: isLoadingWaterSources } = useQuery<WaterSource[], Error>({ queryKey: ['waterSources', farmId], queryFn: () => farmService.getWaterSourcesByFarm(farmIdNum), enabled: !!farmIdNum });
    const { data: assignedUsers = [], isLoading: isLoadingAssignedUsers } = useQuery<UserResponse[], Error>({ queryKey: ['assignedUsers', farmId], queryFn: () => farmService.getAssignedUsers(farmIdNum), enabled: !!farmIdNum });
    const { data: allUsers = [] } = useQuery<UserResponse[], Error>({ queryKey: ['users'], queryFn: adminService.getUsers });

    // --- Mutaciones ---
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

    // --- Manejadores de Eventos ---
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

    const availableUsersToAssign = useMemo(() => { const assignedUserIds = new Set(assignedUsers.map(u => u.id)); return allUsers.filter(u => !assignedUserIds.has(u.id)); }, [allUsers, assignedUsers]);

    if (isLoadingFarm) return <div>Cargando...</div>;
    if (isError) return <div className="error-text">Error: {error.message}</div>;

    return (
        <div className="farm-detail-page">
            <div className="detail-header"> <i className="fas fa-seedling header-icon"></i> <div><h1>{farm?.name}</h1><p>{farm?.location}</p></div> </div>
            <div className="detail-grid">
                <div className="detail-card"> <div className="card-header"><h3>Sectores</h3><button className="btn-add" onClick={handleOpenCreateSectorForm}><i className="fas fa-plus"></i> Añadir Sector</button></div> {isLoadingSectors ? <p>Cargando...</p> : (<table className="detail-table"><thead><tr><th>Nombre</th><th>Equipo Asignado</th><th>Acciones</th></tr></thead><tbody>{sectors.map(s=>(<tr key={s.id}><td>{s.name}</td><td>{s.equipmentName||'N/A'}</td><td className='actions'><UserActionsMenu onEdit={()=>handleOpenEditSectorForm(s)} onChangePassword={()=>{}} onDelete={()=>setSectorToDelete(s)}/></td></tr>))}</tbody></table>)}</div>
                <div className="detail-card"> <div className="card-header"><h3>Equipos de Riego</h3><button className="btn-add" onClick={handleOpenCreateEquipmentForm}><i className="fas fa-plus"></i> Añadir Equipo</button></div> {isLoadingEquipments ? <p>Cargando...</p> : (<table className="detail-table"><thead><tr><th>Nombre</th><th>Tipo</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{equipments.map(eq=>(<tr key={eq.id}><td>{eq.name}</td><td>{eq.equipmentType}</td><td>{eq.equipmentStatus}</td><td className='actions'><UserActionsMenu onEdit={()=>handleOpenEditEquipmentForm(eq)} onChangePassword={()=>{}} onDelete={()=>setEquipmentToDelete(eq)}/></td></tr>))}</tbody></table>)}</div>
                <div className="detail-card"> <div className="card-header"><h3>Fuentes de Agua</h3><button className="btn-add" onClick={handleOpenCreateWaterSourceForm}><i className="fas fa-plus"></i> Añadir Fuente</button></div> {isLoadingWaterSources ? <p>Cargando...</p> : (<table className="detail-table"><thead><tr><th>Tipo</th><th>Acciones</th></tr></thead><tbody>{waterSources.map(ws=>(<tr key={ws.id}><td>{ws.type}</td><td className='actions'><UserActionsMenu onEdit={()=>handleOpenEditWaterSourceForm(ws)} onChangePassword={()=>{}} onDelete={()=>setWaterSourceToDelete(ws)}/></td></tr>))}</tbody></table>)}</div>
                <div className="detail-card">
                    <div className="card-header"><h3>Usuarios Asignados</h3><button className="btn-add" onClick={() => setIsAssignUserModalOpen(true)}><i className="fas fa-plus"></i> Asignar Usuario</button></div>
                    {isLoadingAssignedUsers ? <p>Cargando...</p> : (<table className="detail-table"><thead><tr><th>Nombre</th><th>Username</th><th>Rol</th><th>Acciones</th></tr></thead>
                        <tbody>{assignedUsers.map(user => (<tr key={user.id}><td>{user.name}</td><td>{user.username}</td><td>{user.roleName}</td><td><button className='btn-delete-link' onClick={() => setUserToUnassign(user)}>Desasignar</button></td></tr>))}</tbody>
                    </table>)}
                </div>
            </div>
            
            {isSectorModalOpen && <SectorForm currentSector={currentSector} availableEquipment={equipments} onSave={handleSaveSector} onCancel={()=>setIsSectorModalOpen(false)} isLoading={createSectorMutation.isPending||updateSectorMutation.isPending}/>}
            {sectorToDelete && <ConfirmationModal message={`¿Seguro de eliminar el sector "${sectorToDelete.name}"?`} onConfirm={handleConfirmDeleteSector} onCancel={()=>setSectorToDelete(null)} isLoading={deleteSectorMutation.isPending}/>}
            
            {isEquipmentModalOpen && <EquipmentForm currentEquipment={currentEquipment} onSave={handleSaveEquipment} onCancel={()=>setIsEquipmentModalOpen(false)} isLoading={createEquipmentMutation.isPending||updateEquipmentMutation.isPending}/>}
            {equipmentToDelete && <ConfirmationModal message={`¿Seguro de eliminar el equipo "${equipmentToDelete.name}"?`} onConfirm={handleConfirmDeleteEquipment} onCancel={()=>setEquipmentToDelete(null)} isLoading={deleteEquipmentMutation.isPending}/>}
            
            {isWaterSourceModalOpen && <WaterSourceForm currentWaterSource={currentWaterSource} onSave={handleSaveWaterSource} onCancel={()=>setIsWaterSourceModalOpen(false)} isLoading={createWaterSourceMutation.isPending||updateWaterSourceMutation.isPending}/>}
            {waterSourceToDelete && <ConfirmationModal message={`¿Seguro de eliminar la fuente de agua "${waterSourceToDelete.type}"?`} onConfirm={handleConfirmDeleteWaterSource} onCancel={()=>setWaterSourceToDelete(null)} isLoading={deleteWaterSourceMutation.isPending}/>}
            
            {isAssignUserModalOpen && <AssignUserForm availableUsers={availableUsersToAssign} onSave={handleSaveUserAssignment} onCancel={() => setIsAssignUserModalOpen(false)} isLoading={assignUserMutation.isPending}/>}
            {userToUnassign && <ConfirmationModal message={`¿Seguro de desasignar a "${userToUnassign.name}" de esta finca?`} onConfirm={handleConfirmUnassignUser} onCancel={() => setUserToUnassign(null)} isLoading={unassignUserMutation.isPending}/>}
        </div>
    );
};

export default FarmDetail;