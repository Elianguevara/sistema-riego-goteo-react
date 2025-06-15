import authService from './authService'; // Para obtener el token

// Asumimos que tienes un tipo UserResponse definido, si no, lo crearemos
// Asumimos que tienes un tipo UserResponse definido, si no, lo crearemos
import type { UserResponse, UserCreateData, UserUpdateData } from '../types/user.types';

// Este servicio maneja las operaciones administrativas relacionadas con los usuarios
const API_URL = 'http://localhost:8080/api/admin';
const AUTH_API_URL = 'http://localhost:8080/api/auth';

const getAuthHeader = (): Record<string, string> => {
    const token = authService.getToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

/**
 * Obtiene todos los usuarios desde la API.
 * Cita del archivo: sistema-riego-goteo-api/src/main/java/com/sistemariegoagoteo/sistema_riego_goteo_api/controller/admin/AdminUserController.java
 */
const getUsers = async (): Promise<UserResponse[]> => {
    const response = await fetch(`${API_URL}/users`, {
        method: 'GET',
        headers: getAuthHeader(),
    });

    if (!response.ok) {
        throw new Error('Error al obtener la lista de usuarios.');
    }

    return await response.json();
};

/**
 * Crea un nuevo usuario (Analista u Operario).
 * Cita: El backend usa el endpoint /register para esta acción, como se ve en AuthController.
 */
const createUser = async (userData: UserCreateData): Promise<any> => {
    const response = await fetch(`${AUTH_API_URL}/register`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error('Error al crear el usuario.');
    return await response.text(); // El endpoint de registro devuelve un texto de éxito
};

/**
 * Actualiza los datos de un usuario.
 * Cita: AdminUserController usa el endpoint PUT /api/admin/users/{id}
 */
const updateUser = async (id: number, userData: UserUpdateData): Promise<UserResponse> => {
    const response = await fetch(`${API_URL}/users/${id}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error('Error al actualizar el usuario.');
    return await response.json();
};

/**
 * Elimina un usuario por su ID.
 * Cita: AdminUserController usa el endpoint DELETE /api/admin/users/{id}
 */
const deleteUser = async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/users/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error('Error al eliminar el usuario.');
};


const adminService = {
    getUsers,
    createUser,
    updateUser,
    deleteUser,
};

export default adminService;