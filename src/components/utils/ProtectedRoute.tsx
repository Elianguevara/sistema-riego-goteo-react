import { Navigate, Outlet } from 'react-router-dom';
import authService from '../../services/authService';
import { jwtDecode } from 'jwt-decode'; // <-- 1. Importar la librería

// Interface para el payload del token decodificado
interface DecodedToken {
    exp: number; // 'exp' es el tiempo de expiración estándar en formato UNIX
    // Aquí puedes añadir otras propiedades de tu token si las necesitas (sub, iat, roles, etc.)
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


const ProtectedRoute = () => {
    const token = authService.getToken();

    // Verificación 1: ¿Existe el token?
    if (!token) {
        return <Navigate to="/login" />;
    }

    // Verificación 2: ¿Ha expirado el token?
    if (isTokenExpired(token)) {
        console.warn("Token expirado. Se requiere un nuevo inicio de sesión.");
        authService.logout(); // Limpiamos el token expirado del storage
        return <Navigate to="/login" />;
    }

    // Si el token existe Y es válido, permite el acceso.
    return <Outlet />;
};

export default ProtectedRoute;