import authService from './authService';
import type {
    AgronomicConfig,
    OrganizationConfig,
    SecurityConfig,
    NotificationConfig,
    ReportConfig,
    WeatherConfig
} from '../types/config.types';

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/admin/config`;

const getAuthHeader = (): Record<string, string> => {
    const token = authService.getToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

const handleResponse = async <T>(response: Response): Promise<T> => {
    if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(errorText || `Error HTTP: ${response.status}`);
    }
    return response.json();
};

export const configService = {
    getAgronomic: () => fetch(`${API_URL}/agronomic`, { headers: getAuthHeader() }).then(res => handleResponse<AgronomicConfig>(res)),
    updateAgronomic: (data: AgronomicConfig) => fetch(`${API_URL}/agronomic`, { method: 'PUT', headers: getAuthHeader(), body: JSON.stringify(data) }).then(res => handleResponse<AgronomicConfig>(res)),

    getOrganization: () => fetch(`${API_URL}/organization`, { headers: getAuthHeader() }).then(res => handleResponse<OrganizationConfig>(res)),
    updateOrganization: (data: OrganizationConfig) => fetch(`${API_URL}/organization`, { method: 'PUT', headers: getAuthHeader(), body: JSON.stringify(data) }).then(res => handleResponse<OrganizationConfig>(res)),

    getSecurity: () => fetch(`${API_URL}/security`, { headers: getAuthHeader() }).then(res => handleResponse<SecurityConfig>(res)),
    updateSecurity: (data: SecurityConfig) => fetch(`${API_URL}/security`, { method: 'PUT', headers: getAuthHeader(), body: JSON.stringify(data) }).then(res => handleResponse<SecurityConfig>(res)),

    getNotifications: () => fetch(`${API_URL}/notifications`, { headers: getAuthHeader() }).then(res => handleResponse<NotificationConfig>(res)),
    updateNotifications: (data: NotificationConfig) => fetch(`${API_URL}/notifications`, { method: 'PUT', headers: getAuthHeader(), body: JSON.stringify(data) }).then(res => handleResponse<NotificationConfig>(res)),

    getReports: () => fetch(`${API_URL}/reports`, { headers: getAuthHeader() }).then(res => handleResponse<ReportConfig>(res)),
    updateReports: (data: ReportConfig) => fetch(`${API_URL}/reports`, { method: 'PUT', headers: getAuthHeader(), body: JSON.stringify(data) }).then(res => handleResponse<ReportConfig>(res)),

    getWeather: () => fetch(`${API_URL}/weather`, { headers: getAuthHeader() }).then(res => handleResponse<WeatherConfig>(res)),
    updateWeather: (data: WeatherConfig) => fetch(`${API_URL}/weather`, { method: 'PUT', headers: getAuthHeader(), body: JSON.stringify(data) }).then(res => handleResponse<WeatherConfig>(res)),
};

export default configService;
