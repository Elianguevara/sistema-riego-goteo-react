// Archivo: src/services/reportService.ts

import authService from './authService';
import { toast } from 'sonner';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/reports`;

/**
 * Inicia el proceso de generación de reporte, realiza polling del estado
 * y descarga el archivo cuando esté listo.
 * @param queryParams Objeto URLSearchParams con todos los filtros para el reporte.
 */
const downloadReport = async (queryParams: URLSearchParams) => {
    const generateUrl = `${API_BASE_URL}/generate?${queryParams.toString()}`;
    const token = authService.getToken();

    try {
        // 1. Iniciar la tarea de generación
        const initialResponse = await fetch(generateUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!initialResponse.ok) {
            const errorText = await initialResponse.text();
            throw new Error(`Error al iniciar generación: ${initialResponse.status} - ${errorText || 'Error desconocido'}`);
        }

        const { taskId } = await initialResponse.json();
        if (!taskId) throw new Error('No se recibió un ID de tarea válido.');

        toast.info("Generación iniciada, procesando en segundo plano...");

        // 2. Ciclo de Polling
        let isCompleted = false;
        let downloadUrl = '';

        while (!isCompleted) {
            // Esperar 3 segundos entre consultas
            await new Promise(resolve => setTimeout(resolve, 3000));

            const statusResponse = await fetch(`${API_BASE_URL}/status/${taskId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!statusResponse.ok) {
                throw new Error('Error al consultar el estado del reporte.');
            }

            const statusData = await statusResponse.json();

            if (statusData.status === 'COMPLETED') {
                isCompleted = true;
                downloadUrl = statusData.downloadUrl; // Se asume que el backend devuelve la URL final

                // Si el backend no devuelve URL pero sí el binario en este punto (poco probable en polling puro)
                // O si necesitamos hacer un GET final a la URL de descarga:
                if (downloadUrl) {
                    await triggerFileDownload(downloadUrl, token);
                } else {
                    throw new Error('Reporte completado pero no se recibió URL de descarga.');
                }

            } else if (statusData.status === 'FAILED') {
                throw new Error(statusData.errorMessage || 'La generación del reporte falló en el servidor.');
            }
            // Si el estado es 'PROCESSING' o similar, continúa el bucle
        }

    } catch (error: any) {
        console.error('Error en el flujo de reporte:', error);
        toast.error(`No se pudo procesar el reporte: ${error.message}`);
        throw error; // Relanzar para que el componente también sepa que falló
    }
};

/**
 * Función auxiliar para manejar la descarga física del archivo
 */
const triggerFileDownload = async (url: string, token: string | null) => {
    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${token}`,
        }
    });

    if (!response.ok) throw new Error('No se pudo descargar el archivo final.');

    const disposition = response.headers.get('Content-Disposition');
    let filename = 'reporte';

    if (disposition?.includes('attachment')) {
        const filenameMatch = /filename="?([^"]+)"?/.exec(disposition);
        if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1];
        }
    }

    const blob = await response.blob();
    const objectUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(objectUrl);

    toast.success(`Descarga lista: ${filename}`);
};

const reportService = {
    downloadReport,
};

export default reportService;