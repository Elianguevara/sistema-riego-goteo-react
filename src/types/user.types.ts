// Interfaz para la respuesta de la API (ya la teníamos)
export interface UserResponse {
  id: number;
  username: string;
  email: string;
  name: string;
  roleName: string;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  farms?: { id: number; name: string }[];
}

// Interfaz para el formulario de CREACIÓN
export interface UserCreateData {
  name: string;
  username: string;
  password?: string;
  email: string;
  rol: 'ADMIN' | 'ANALISTA' | 'OPERARIO';
}

// Interfaz para el formulario de ACTUALIZACIÓN
export interface UserUpdateData {
  name: string;
  email: string;
}
// Interfaz para el cambio de estado (activo/inactivo)
export interface UserStatusUpdateData {
  active: boolean;
}

// Interfaz para el cambio de contraseña por parte del admin
export interface PasswordUpdateData {
  newPassword: string;
}
export interface SelfPasswordUpdateData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// --- NUEVA INTERFAZ ---
// Define los parámetros para la petición de usuarios paginados
export interface UserRequestParams {
  page?: number;
  size?: number;
  sort?: string;
}
