// Archivo: src/components/tasks/TaskReportDownload.tsx

import { useState } from 'react';
import { toast } from 'sonner';
import { FileText, FileSpreadsheet, Loader, ClipboardList } from 'lucide-react';
import reportService from '../../services/reportService';
import './TaskReportDownload.css';

/**
 * Tarjeta de exportación directa de tareas.
 *
 * Provee dos botones de descarga sin flujo asíncrono (sin polling):
 *   - PDF  → GET /api/reports/tasks/pdf
 *   - Excel → GET /api/reports/tasks/excel
 *
 * Manejo de estados:
 *   - Mientras se descarga PDF, ambos botones quedan deshabilitados.
 *   - Mientras se descarga Excel, ambos botones quedan deshabilitados.
 *   - Los toast de info/success/error los maneja el servicio y este componente.
 *
 * Uso:
 *   <TaskReportDownload />
 */
const TaskReportDownload = () => {

    // Estado de carga independiente por formato para mostrar el spinner correcto
    const [isDownloadingPdf, setIsDownloadingPdf]     = useState(false);
    const [isDownloadingExcel, setIsDownloadingExcel] = useState(false);

    // Cualquier descarga en curso bloquea ambos botones para evitar descargas simultáneas
    const isBusy = isDownloadingPdf || isDownloadingExcel;

    // ── Descarga PDF ───────────────────────────────────────────────────────

    const handleDownloadPdf = async () => {
        setIsDownloadingPdf(true);
        try {
            // El servicio muestra toast.info y toast.success internamente.
            // Solo capturamos el error para mostrar el mensaje específico.
            await reportService.downloadTasksPdf();
        } catch (error) {
            const err = error as Error;
            toast.error(`No se pudo descargar el PDF: ${err.message}`);
        } finally {
            // finally garantiza que el botón siempre se reactive,
            // incluso si el navegador bloqueó el popup de descarga.
            setIsDownloadingPdf(false);
        }
    };

    // ── Descarga Excel ─────────────────────────────────────────────────────

    const handleDownloadExcel = async () => {
        setIsDownloadingExcel(true);
        try {
            await reportService.downloadTasksExcel();
        } catch (error) {
            const err = error as Error;
            toast.error(`No se pudo descargar el Excel: ${err.message}`);
        } finally {
            setIsDownloadingExcel(false);
        }
    };

    // ── Render ─────────────────────────────────────────────────────────────

    return (
        <div className="trd-card">

            {/* Sección izquierda: ícono + textos */}
            <div className="trd-info">
                <div className="trd-icon-wrapper">
                    <ClipboardList className="trd-icon" />
                </div>
                <div>
                    <h2 className="trd-title">Reporte de Tareas</h2>
                    <p className="trd-description">
                        Exporta el listado completo de tareas con membrete corporativo, logo y tabla estilizada.
                    </p>
                </div>
            </div>

            {/* Sección derecha: botones de descarga */}
            <div className="trd-buttons">

                {/* Botón PDF */}
                <button
                    onClick={handleDownloadPdf}
                    disabled={isBusy}
                    className="trd-btn trd-btn--pdf"
                    title="Descargar listado de tareas en formato PDF"
                >
                    {isDownloadingPdf ? (
                        <>
                            <Loader className="trd-btn-icon animate-spin" />
                            <span>Generando...</span>
                        </>
                    ) : (
                        <>
                            <FileText className="trd-btn-icon" />
                            <span>Descargar PDF</span>
                        </>
                    )}
                </button>

                {/* Botón Excel */}
                <button
                    onClick={handleDownloadExcel}
                    disabled={isBusy}
                    className="trd-btn trd-btn--excel"
                    title="Descargar listado de tareas en formato Excel (.xlsx)"
                >
                    {isDownloadingExcel ? (
                        <>
                            <Loader className="trd-btn-icon animate-spin" />
                            <span>Generando...</span>
                        </>
                    ) : (
                        <>
                            <FileSpreadsheet className="trd-btn-icon" />
                            <span>Descargar Excel</span>
                        </>
                    )}
                </button>

            </div>
        </div>
    );
};

export default TaskReportDownload;
