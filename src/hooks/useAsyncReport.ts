import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import reportService from '../services/reportService';

/**
 * Custom hook para manejar la generación asíncrona de reportes con polling
 */
export const useAsyncReport = () => {
    const [taskId, setTaskId] = useState<string | null>(null);

    // Iniciar la generación del reporte
    const generateReport = async (queryParams: URLSearchParams) => {
        try {
            toast.loading('Generando reporte, por favor espera...', { id: 'report-toast' });
            const response = await reportService.generateAsyncReport(queryParams);
            if (response.taskId) {
                setTaskId(response.taskId);
            }
        } catch (error: Error | unknown) {
            const err = error as Error;
            toast.error(`Error al iniciar generación: ${err.message}`, { id: 'report-toast' });
            setTaskId(null);
        }
    };

    // React Query para hacer polling del estado (refetchInterval)
    const { data: statusData } = useQuery({
        queryKey: ['reportStatus', taskId],
        queryFn: () => reportService.getReportStatus(taskId!),
        enabled: !!taskId,
        refetchInterval: (query) => {
            const status = query.state?.data?.status;
            // Detener el polling si completó o falló
            if (status === 'COMPLETED' || status === 'FAILED') {
                return false;
            }
            // De lo contrario, consultar cada 3 segundos
            return 3000;
        },
    });

    // Efecto para actuar sobre los cambios de estado
    useEffect(() => {
        if (!statusData || !taskId) return;

        if (statusData.status === 'COMPLETED') {
            toast.success('Reporte generado exitosamente.', { id: 'report-toast' });
            setTaskId(null); // Detener el hook y limpiar estado

            // Disparar la descarga según si el backend nos devolvió URL o no
            if (statusData.id) {
                reportService.downloadReportFile(statusData.id).catch(err => {
                    toast.error(`Error al descargar: ${err.message}`);
                });
            } else {
                reportService.downloadReportFile(taskId).catch(err => {
                    toast.error(`Error al descargar: ${err.message}`);
                });
            }
        } else if (statusData.status === 'FAILED') {
            toast.error(`Error generando reporte: ${statusData.errorMessage || 'Error desconocido'}`, { id: 'report-toast' });
            setTaskId(null); // Detener el hook y limpiar estado
        }
    }, [statusData, taskId]);

    const isGenerating = !!taskId;

    return {
        generateReport,
        isGenerating
    };
};

export default useAsyncReport;
