import type { AuthResponse } from '../types/auth.types';

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/auth`;

/**
 * Llama al endpoint de login de la API usando la API fetch() nativa.
 */
const login = async (username: string, password: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
        // --- INICIO DE LA MODIFICACIÓN ---
        try {
            const errorText = await response.text();
            // Verificamos si el error específico del backend está presente
            if (errorText.includes("User is disabled")) {
                throw new Error("USER_DISABLED"); // Lanzamos un error específico
            }
        } catch (e) {
            // Si no podemos leer el texto, o es otro tipo de error, continuamos con el error general
        }
        throw new Error(`Error HTTP: ${response.status}`);
        // --- FIN DE LA MODIFICACIÓN ---
    }

    const data: AuthResponse = await response.json();
    
    if (data.token) {
        localStorage.setItem('authToken', data.token);
    }
    return data;
};

const logout = (): void => {
    localStorage.removeItem('authToken');
};

const getToken = (): string | null => {
    return localStorage.getItem('authToken');
};

const authService = {
    login,
    logout,
    getToken,
};

export default authService;