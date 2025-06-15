import  { useState, useEffect, useCallback } from 'react';
import adminService from '../services/adminService';
import type { UserResponse, UserCreateData, UserUpdateData } from '../types/user.types';
import UserForm from '../components/users/UserForm'; // Importamos el formulario
import './UserManagement.css';

const UserManagement = () => {
    const [users, setUsers] = useState<UserResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Estado para manejar el formulario
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [currentUser, setCurrentUser] = useState<UserResponse | null>(null);

    const fetchUsers = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await adminService.getUsers();
            setUsers(data);
            setError(null);
        } catch (err) {
            setError('No se pudieron cargar los usuarios.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setIsLoading(true);
                const data = await adminService.getUsers();
                setUsers(data);
                setError(null);
            } catch (err) {
                setError('No se pudieron cargar los usuarios.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, []);
 useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleCreate = () => {
        setCurrentUser(null); // Aseguramos que no hay usuario actual
        setIsFormVisible(true);
    };

    const handleEdit = (user: UserResponse) => {
        setCurrentUser(user);
        setIsFormVisible(true);
    };

    const handleDelete = async (userId: number) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
            try {
                await adminService.deleteUser(userId);
                fetchUsers(); // Recargar la lista de usuarios
            } catch (error) {
                console.error('Error al eliminar usuario:', error);
                setError('No se pudo eliminar el usuario.');
            }
        }
    };

    const handleSave = async (userData: UserCreateData | UserUpdateData) => {
        try {
            if (currentUser) { // Modo edición
                await adminService.updateUser(currentUser.id, userData as UserUpdateData);
            } else { // Modo creación
                await adminService.createUser(userData as UserCreateData);
            }
            setIsFormVisible(false);
            fetchUsers(); // Recargar la lista
        } catch (error) {
            console.error('Error al guardar usuario:', error);
            setError('No se pudo guardar el usuario.');
        }
    };

    return (
        <div className="user-management-page">
            <div className="page-header">
                <h1>Usuarios</h1>
                <button className="create-user-btn" onClick={handleCreate}>
                    <i className="fas fa-plus"></i> Crear Usuario
                </button>
            </div>
            
            {isFormVisible && (
                <UserForm 
                    currentUser={currentUser} 
                    onSave={handleSave} 
                    onCancel={() => setIsFormVisible(false)} 
                />
            )}
            
            {isLoading && <p>Cargando usuarios...</p>}
            {error && <p className="error-text">{error}</p>}
            
            {!isLoading && !error && (
                 <div className="user-table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Nombre de usuario</th>
                                <th>Email</th>
                                <th>Rol</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td>{user.name}</td>
                                    <td>{user.username}</td>
                                    <td>{user.email}</td>
                                    <td>{user.roleName}</td>
                                    <td>
                                        <span className={`status-badge ${user.active ? 'active' : 'inactive'}`}>
                                            {user.active ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="actions">
                                        <i className="fas fa-pencil-alt action-icon edit" onClick={() => handleEdit(user)}></i>
                                        <i className="fas fa-trash-alt action-icon delete" onClick={() => handleDelete(user.id)}></i>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default UserManagement;