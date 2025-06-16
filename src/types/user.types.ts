// Interfaz para la respuesta de la API (ya la teníamos)
export interface UserResponse {
  id: number;
  name: string;
  username: string;
  email: string;
  roleName: string;
  active: boolean;
  lastLogin: string | null;
}

// Interfaz para el formulario de CREACIÓN
// Corresponde a RegisterRequest.java
export interface UserCreateData {
  name: string;
  username: string;
  password?: string; // Es opcional en la UI si se genera, pero requerido en el backend
  email: string;
  rol: 'ADMIN' | 'ANALISTA' | 'OPERARIO';
}

// Interfaz para el formulario de ACTUALIZACIÓN
// Corresponde a UserUpdateRequest.java
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