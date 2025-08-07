// Archivo: src/components/utils/ProtectedRoute.tsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import authService from '../../services/authService';
import type { DecodedToken } from '../../types/auth.types';

const isTokenExpired = (token: string): boolean => {
    try {
        const decoded: DecodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        return decoded.exp < currentTime;
    } catch (error) {
        console.error("Error al decodificar el token:", error);
        return true; 
    }
};

// Props: Recibe los roles permitidos y el componente a renderizar (children)
interface ProtectedRouteProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

const ProtectedRoute = ({ allowedRoles, children }: ProtectedRouteProps) => {
    const token = authService.getToken();

    // 1. Verificación de token
    if (!token || isTokenExpired(token)) {
        authService.logout();
        return <Navigate to="/login" replace />;
    }

    // 2. Verificación de rol
    const decoded: DecodedToken = jwtDecode(token);
    const userRole = decoded.rol;
    const isAuthorized = allowedRoles.includes(userRole);

    if (!isAuthorized) {
        // 3. Si no está autorizado, lo enviamos a una página segura que SÍ puede ver.
        console.warn(`Acceso denegado. Rol del usuario '${userRole}' no está en la lista de permitidos: [${allowedRoles.join(', ')}]`);
        return <Navigate to="/dashboard" replace />;
    }

    // 4. ¡Éxito! Renderiza el componente que le pasamos.
    return <>{children}</>;
};

export default ProtectedRoute;