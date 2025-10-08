// Archivo: src/services/reportService.ts

import authService from './authService';
import { toast } from 'sonner';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/reports`;

/**
 * Construye la URL completa y maneja la descarga del archivo de reporte.
 * @param queryParams Objeto URLSearchParams con todos los filtros para el reporte.
 */
const downloadReport = async (queryParams: URLSearchParams) => {
    const url = `${API_BASE_URL}/generate?${queryParams.toString()}`;
    const token = authService.getToken();

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error del servidor: ${response.status} - ${errorText || 'No se pudo obtener el detalle del error.'}`);
        }

        const disposition = response.headers.get('Content-Disposition');
        let filename = 'reporte.bin'; // Nombre por defecto
        if (disposition?.includes('attachment')) {
            const filenameMatch = /filename="?([^"]+)"?/.exec(disposition);
            if (filenameMatch && filenameMatch[1]) {
                filename = filenameMatch[1];
            }
        }

        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);
        
        toast.success(`Descarga iniciada: ${filename}`);

    } catch (error: any) {
        console.error('Error al descargar el reporte:', error);
        toast.error(`No se pudo generar el reporte: ${error.message}`);
    }
};

const reportService = {
    downloadReport,
};

export default reportService;