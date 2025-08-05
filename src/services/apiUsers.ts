// src/services/apiUsers.ts

// 1. Importamos el servicio de autenticación por defecto
import authService from "./authService"; 
// 2. Importamos los tipos desde su archivo centralizado, que ahora son más específicos
import type { 
    UserResponse, 
    UserCreateData, 
    UserUpdateData, 
    UserStatusUpdateData,
    PasswordUpdateData 
} from "../types/user.types";

// 3. Definimos la URL base para el CRUD de usuarios del administrador
const USERS_API_URL = `${import.meta.env.VITE_API_BASE_URL}/admin/users`;

// --- FUNCIONES CRUD Y DE GESTIÓN ---

// GET (Obtener todos los usuarios)
export const getUsers = async (): Promise<UserResponse[]> => {
  const token = authService.getToken();
  const response = await fetch(USERS_API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("No se pudieron cargar los usuarios.");
  }
  return response.json();
};

// POST (Crear un nuevo usuario)
export const createUser = async (userData: UserCreateData): Promise<UserResponse> => {
    const token = authService.getToken();
    const response = await fetch(USERS_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'No se pudo crear el usuario.');
    }
    return response.json();
};

// PUT (Actualizar un usuario existente)
export const updateUser = async (userId: number, userData: UserUpdateData): Promise<UserResponse> => {
    const token = authService.getToken();
    const response = await fetch(`${USERS_API_URL}/${userId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'No se pudo actualizar el usuario.');
    }
    return response.json();
};

// DELETE (Eliminar un usuario)
export const deleteUser = async (userId: number): Promise<void> => {
  const token = authService.getToken();
  const response = await fetch(`${USERS_API_URL}/${userId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("No se pudo eliminar el usuario.");
  }
};

// PATCH (Actualizar estado de un usuario)
export const updateUserStatus = async (userId: number, statusData: UserStatusUpdateData): Promise<void> => {
    const token = authService.getToken();
    const response = await fetch(`${USERS_API_URL}/${userId}/status`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(statusData),
    });

    if (!response.ok) {
        throw new Error("No se pudo actualizar el estado del usuario.");
    }
};

// PATCH (Actualizar contraseña de un usuario por el admin)
export const updateUserPasswordByAdmin = async (userId: number, passwordData: PasswordUpdateData): Promise<void> => {
    const token = authService.getToken();
    const response = await fetch(`${USERS_API_URL}/${userId}/password`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(passwordData),
    });

    if (!response.ok) {
        throw new Error("No se pudo actualizar la contraseña del usuario.");
    }
};
