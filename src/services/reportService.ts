// Archivo: src/services/reportService.ts

import authService from './authService';
import { toast } from 'sonner';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/reports`;

export interface AsyncReportStatus {
    id: string;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    reportType: string;
    format: string;
    createdAt: string;
    errorMessage?: string;
    downloadUrl?: string;
}

/**
 * Inicia la generación asíncrona del reporte.
 */
const generateAsyncReport = async (queryParams: URLSearchParams): Promise<{ taskId: string }> => {
    const token = authService.getToken();
    const response = await fetch(`${API_BASE_URL}/generate?${queryParams.toString()}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error al iniciar generación: ${response.status} - ${errorText || 'Error desconocido'}`);
    }
    const data = await response.json();
    return { taskId: data.id };
};

/**
 * Consulta el estado de una tarea de reporte.
 */
const getReportStatus = async (taskId: string): Promise<AsyncReportStatus> => {
    const token = authService.getToken();
    const response = await fetch(`${API_BASE_URL}/status/${taskId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
        throw new Error('Error al consultar el estado del reporte.');
    }
    return response.json();
};

/**
 * Descarga el archivo generado de forma asíncrona usando su ID.
 */
const downloadReportFile = async (taskId: string): Promise<void> => {
    const token = authService.getToken();
    const url = `${API_BASE_URL}/download/${taskId}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('No se pudo descargar el archivo final.');

    const disposition = response.headers.get('Content-Disposition');
    let filename = 'reporte';
    if (disposition) {
        const match = /filename\*?=(?:UTF-8'')?["']?([^"';\n]+)["']?/i.exec(disposition) || /filename="?([^"]+)"?/.exec(disposition);
        if (match?.[1]) filename = decodeURIComponent(match[1]);
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
};

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

    } catch (error: Error | unknown) {
        const err = error as Error;
        console.error('Error en el flujo de reporte:', err);
        toast.error(`No se pudo procesar el reporte: ${err.message}`);
        throw err; // Relanzar para que el componente también sepa que falló
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

/**
 * Descarga el reporte corporativo PDF directamente desde el backend.
 * El endpoint devuelve el binario PDF en una sola llamada (sin polling).
 * Se usa fetch con response.blob(), equivalente a responseType:'blob' de Axios.
 */
const downloadCorporateReport = async (): Promise<void> => {
    const token = authService.getToken();
    const url = `${API_BASE_URL}/download/pdf`;

    toast.info('Preparando reporte corporativo...');

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`Error ${response.status}: ${errorText || 'No se pudo obtener el reporte.'}`);
    }

    // Leer el cuerpo como Blob — el navegador lo trata como binario,
    // nunca intenta decodificarlo como texto (equivalente a responseType:'blob').
    const blob = await response.blob();

    // Extraer nombre de archivo del header Content-Disposition si el backend lo envía
    const disposition = response.headers.get('Content-Disposition');
    let filename = 'reporte-corporativo.pdf';
    if (disposition) {
        const match = /filename\*?=(?:UTF-8'')?["']?([^"';\n]+)["']?/i.exec(disposition);
        if (match?.[1]) filename = decodeURIComponent(match[1]);
    }

    // Crear URL temporal, simular click en enlace oculto y liberar la URL
    const objectUrl = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = filename;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(objectUrl);

    toast.success(`Descarga iniciada: ${filename}`);
};

const reportService = {
    downloadReport,
    downloadCorporateReport,
    generateAsyncReport,
    getReportStatus,
    downloadReportFile,
};

export default reportService;