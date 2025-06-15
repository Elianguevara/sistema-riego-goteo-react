import type { AuthResponse } from '../types/auth.types';

const API_URL = 'http://localhost:8080/api/auth';

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
        throw new Error(`Error HTTP: ${response.status}`);
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