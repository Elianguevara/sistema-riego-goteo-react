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

// ─────────────────────────────────────────────────────────────────────────────
//  DESCARGA DIRECTA DE TAREAS — PDF y Excel
//  Endpoints: GET /api/reports/tasks/pdf  |  GET /api/reports/tasks/excel
//  El backend devuelve el binario en una sola respuesta HTTP (sin polling).
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Auxiliar reutilizable: ejecuta la llamada fetch, valida la respuesta y
 * dispara la descarga del blob en el navegador.
 *
 * @param endpoint  Ruta relativa al API_BASE_URL (ej. "/tasks/pdf")
 * @param fallback  Nombre de archivo de respaldo si el backend no lo informa
 * @throws {Error}  Si la respuesta HTTP no es 2xx, con mensaje descriptivo
 */
const _downloadBinaryReport = async (endpoint: string, fallback: string): Promise<void> => {
    const token = authService.getToken();

    // Si no hay token activo, el backend devolverá 401; informamos antes de llamar.
    if (!token) {
        throw new Error('No hay sesión activa. Iniciá sesión para descargar reportes.');
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
            // El backend valida el JWT en el filtro JwtAuthenticationFilter.
            'Authorization': `Bearer ${token}`,
        },
    });

    // Si el servidor devuelve error, intentamos leer el cuerpo como texto para
    // incluir el detalle en el mensaje (el backend devuelve text/plain en errores 5xx).
    if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(
            `Error ${response.status} al obtener el reporte: ${errorText || 'Error desconocido en el servidor.'}`
        );
    }

    // Leer el cuerpo como Blob — nunca como texto ni JSON.
    // El navegador lo trata como bytes opacos, sin intentar ninguna decodificación.
    const blob = await response.blob();

    // Extraer el nombre de archivo desde el header Content-Disposition.
    // El backend lo envía como: attachment; filename="tasks-report-20240315.pdf"
    // La regex maneja tanto filename= como filename*= (RFC 5987).
    const disposition = response.headers.get('Content-Disposition');
    let filename = fallback;
    if (disposition) {
        const match =
            /filename\*?=(?:UTF-8'')?["']?([^"';\n]+)["']?/i.exec(disposition);
        if (match?.[1]) filename = decodeURIComponent(match[1].trim());
    }

    // Técnica estándar para forzar descarga en el navegador sin redirigir la página:
    //   1. Crear una URL temporal apuntando al Blob en memoria.
    //   2. Simular un click en un <a> oculto con el atributo `download`.
    //   3. Liberar la URL para que el GC pueda reclamar la memoria del Blob.
    const objectUrl = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = filename;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(objectUrl);
};

/**
 * Descarga todas las tareas del sistema como PDF corporativo.
 *
 * El documento incluye membrete con logo, tabla estilizada (#10b981)
 * y pie de página con numeración "Página X de Y".
 *
 * @throws {Error} Si no hay sesión activa o el servidor devuelve error
 */
const downloadTasksPdf = async (): Promise<void> => {
    // Nombre de respaldo con fecha actual; el servidor normalmente lo sobreescribe.
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const fallbackFilename = `tasks-report-${today}.pdf`;

    toast.info('Generando reporte PDF de tareas...');

    // _downloadBinaryReport lanza Error si response.ok === false.
    // Dejamos que el error se propague para que el llamador (useMutation / handler)
    // lo capture y muestre el toast.error correspondiente.
    await _downloadBinaryReport('/tasks/pdf', fallbackFilename);

    toast.success(`Reporte PDF descargado: ${fallbackFilename}`);
};

/**
 * Descarga todas las tareas del sistema como planilla Excel (.xlsx).
 *
 * El documento incluye membrete con logo embebido, encabezados estilizados
 * en verde, zebra striping y columnas con auto-ajuste de ancho.
 *
 * @throws {Error} Si no hay sesión activa o el servidor devuelve error
 */
const downloadTasksExcel = async (): Promise<void> => {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const fallbackFilename = `tasks-report-${today}.xlsx`;

    toast.info('Generando reporte Excel de tareas...');

    await _downloadBinaryReport('/tasks/excel', fallbackFilename);

    toast.success(`Reporte Excel descargado: ${fallbackFilename}`);
};



const reportService = {
    // Flujo asíncrono (generate → poll → download)
    downloadReport,
    generateAsyncReport,
    getReportStatus,
    downloadReportFile,
    // Descarga directa (respuesta binaria inmediata)
    downloadTasksPdf,
    downloadTasksExcel,
};

export default reportService;