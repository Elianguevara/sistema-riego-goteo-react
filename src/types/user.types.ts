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
  rol: 'ANALISTA' | 'OPERARIO';
}

// Interfaz para el formulario de ACTUALIZACIÓN
// Corresponde a UserUpdateRequest.java
export interface UserUpdateData {
  name: string;
  email: string;
}