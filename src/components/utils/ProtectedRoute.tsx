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

interface ProtectedRouteProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

const ProtectedRoute = ({ allowedRoles, children }: ProtectedRouteProps) => {
    const token = authService.getToken();

    // 1. Si no hay token o ha expirado, redirige al login.
    if (!token || isTokenExpired(token)) {
        authService.logout();
        return <Navigate to="/login" replace />;
    }

    // 2. Decodifica el token para verificar el rol.
    const decoded: DecodedToken = jwtDecode(token);
    const userRole = decoded.rol;
    const isAuthorized = allowedRoles.includes(userRole);

    if (!isAuthorized) {
        // 3. Si el rol no está permitido, redirige a una página segura (el dashboard).
        //    Esto previene que se quede en una página en blanco si intenta acceder a una URL no permitida.
        console.warn(`Acceso denegado a la ruta. Rol requerido: ${allowedRoles}. Rol del usuario: ${userRole}`);
        return <Navigate to="/dashboard" replace />;
    }

    // 4. ¡Acceso concedido! Renderiza el componente hijo que se le pasó.
    return <>{children}</>;
};

export default ProtectedRoute;