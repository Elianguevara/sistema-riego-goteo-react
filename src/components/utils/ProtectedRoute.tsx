//import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import authService from '../../services/authService';

const ProtectedRoute = () => {
    const token = authService.getToken();

    // Si no hay token, redirige a la página de login
    if (!token) {
        return <Navigate to="/login" />;
    }

    // Si hay un token, muestra el contenido de la ruta (usando Outlet)
    // Nota: Una mejora futura sería decodificar el token aquí para verificar
    // la expiración y el rol del usuario.
    return <Outlet />;
};

export default ProtectedRoute;