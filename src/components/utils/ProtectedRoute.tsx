import { Navigate, Outlet } from 'react-router-dom';
import authService from '../../services/authService';
import { jwtDecode } from 'jwt-decode'; // <-- 1. Importar la librería

// Interface para el payload del token decodificado
interface DecodedToken {
    exp: number; // 'exp' es el tiempo de expiración estándar en formato UNIX
    sub: string;// Aquí puedes añadir otras propiedades de tu token si las necesitas (sub, iat, roles, etc.)
    rol: string; // <-- Ajustado al nombre de tu claim
}

/**
 * Verifica si un token JWT ha expirado.
 * @param token El string del token JWT.
 * @returns `true` si el token ha expirado, `false` en caso contrario.
 */
const isTokenExpired = (token: string): boolean => {
    try {
        const decoded: DecodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000; // Tiempo actual en segundos

        // Si el tiempo de expiración es menor que el tiempo actual, el token ha expirado.
        return decoded.exp < currentTime;
    } catch (error) {
        // Si hay un error al decodificar, el token es inválido o malformado.
        console.error("Error al decodificar el token:", error);
        return true; 
    }
};
    // Props para nuestro componente
interface ProtectedRouteProps {
  allowedRoles: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
    const token = authService.getToken();

    // 1. Verificación de existencia del token
    if (!token) {
        return <Navigate to="/login" />;
    }

    // 2. Verificación de expiración del token
    if (isTokenExpired(token)) {
        authService.logout();
        return <Navigate to="/login" />;
    }

    // 3. Verificación de Rol (lógica simplificada y ajustada)
    const decoded: DecodedToken = jwtDecode(token);
    const userRole = decoded.rol; // Obtenemos el rol del usuario desde el token

    // Verificamos si el rol del usuario está incluido en la lista de roles permitidos
    const isAuthorized = allowedRoles.includes(userRole);

    if (!isAuthorized) {
        // Si el usuario está logueado pero no tiene el rol correcto,
        // lo redirigimos. Una página "Acceso Denegado" sería ideal,
        // pero por ahora lo mandamos al login para seguridad.
        console.warn(`Acceso denegado. Rol requerido: ${allowedRoles}. Rol del usuario: ${userRole}`);
        return <Navigate to="/login" />;
    }

    // ¡Acceso concedido!
    return <Outlet />;
};

export default ProtectedRoute;