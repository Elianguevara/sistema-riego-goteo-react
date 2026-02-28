import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Mock } from 'vitest';
import reportService from './reportService';
import authService from './authService';

// Mocks
vi.mock('./authService', () => ({
    default: {
        getToken: vi.fn(),
    }
}));

vi.mock('sonner', () => ({
    toast: {
        info: vi.fn(),
        success: vi.fn(),
        error: vi.fn(),
        loading: vi.fn(),
    }
}));

// Setup global fetch mock
const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

describe('reportService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (authService.getToken as Mock).mockReturnValue('mock-token');

        vi.stubGlobal('URL', {
            createObjectURL: vi.fn(() => 'blob:mock-url'),
            revokeObjectURL: vi.fn(),
        });

        // Mock DOM properly
        vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as any);
    });

    afterEach(() => {
        vi.restoreAllMocks(); // This is better than resetAllMocks as it restores the original implementation
    });

    describe('generateAsyncReport', () => {
        it('should initiate report generation and return taskId', async () => {
            fetchMock.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ id: 'task-123' })
            });

            const params = new URLSearchParams({ reportType: 'WATER_BALANCE' });
            const result = await reportService.generateAsyncReport(params);

            expect(result).toEqual({ taskId: 'task-123' });
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/reports/generate?reportType=WATER_BALANCE'),
                expect.objectContaining({
                    method: 'GET',
                    headers: { 'Authorization': 'Bearer mock-token' }
                })
            );
        });

        it('should throw an error if generation fails', async () => {
            fetchMock.mockResolvedValueOnce({
                ok: false,
                status: 400,
                text: async () => 'Invalid parameters'
            });

            const params = new URLSearchParams();
            await expect(reportService.generateAsyncReport(params)).rejects.toThrow('Error al iniciar generación: 400 - Invalid parameters');
        });
    });

    describe('getReportStatus', () => {
        it('should return the report status', async () => {
            const mockStatus = { id: 'task-123', status: 'COMPLETED' };
            fetchMock.mockResolvedValueOnce({
                ok: true,
                json: async () => mockStatus
            });

            const result = await reportService.getReportStatus('task-123');

            expect(result).toEqual(mockStatus);
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/reports/status/task-123'),
                expect.objectContaining({ headers: { 'Authorization': 'Bearer mock-token' } })
            );
        });

        it('should throw error if status check fails', async () => {
            fetchMock.mockResolvedValueOnce({ ok: false });
            await expect(reportService.getReportStatus('task-123')).rejects.toThrow('Error al consultar el estado del reporte.');
        });
    });

    describe('downloadReportFile', () => {
        it('should correctly simulate downloading the file', async () => {
            fetchMock.mockResolvedValueOnce({
                ok: true,
                headers: new Headers({ 'Content-Disposition': 'attachment; filename="report-data.pdf"' }),
                blob: async () => new Blob(['pdf content']),
            });

            // Use a real element so document.body.appendChild doesn't throw type errors in JSDOM
            const mockElement = document.createElement('a');
            vi.spyOn(mockElement, 'click').mockImplementation(() => { });
            vi.spyOn(mockElement, 'remove').mockImplementation(() => { });
            vi.spyOn(document, 'createElement').mockReturnValue(mockElement);

            await reportService.downloadReportFile('task-123');

            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/reports/download/task-123'),
                expect.objectContaining({ method: 'GET' })
            );

            expect(mockElement.download).toBe('report-data.pdf');
            expect(mockElement.click).toHaveBeenCalled();
            expect(mockElement.remove).toHaveBeenCalled();
        });

        it('should default filename to reporte if no disposition header is present', async () => {
            fetchMock.mockResolvedValueOnce({
                ok: true,
                headers: new Headers(), // No disposition
                blob: async () => new Blob(['content']),
            });

            const mockElement = document.createElement('a');
            vi.spyOn(mockElement, 'click').mockImplementation(() => { });
            vi.spyOn(mockElement, 'remove').mockImplementation(() => { });
            vi.spyOn(document, 'createElement').mockReturnValue(mockElement);

            await reportService.downloadReportFile('task-123');
            expect(mockElement.download).toBe('reporte');
        });

        it('should throw an error if download fails', async () => {
            fetchMock.mockResolvedValueOnce({ ok: false });
            await expect(reportService.downloadReportFile('task-123')).rejects.toThrow('No se pudo descargar el archivo final.');
        });
    });


});
