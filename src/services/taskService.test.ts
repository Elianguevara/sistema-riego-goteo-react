import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Mock } from 'vitest';
import taskService from './taskService';
import authService from './authService';

vi.mock('./authService');

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

describe('taskService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (authService.getToken as Mock).mockReturnValue('mock-token');
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    const setupFetchMock = (data: any, ok: boolean = true) => {
        fetchMock.mockResolvedValueOnce({
            ok,
            json: async () => data,
            text: async () => (typeof data === 'string' ? data : JSON.stringify(data)),
        });
    };

    describe('getMyTasks', () => {
        it('should fetch tasks handling content array payload', async () => {
            const mockTasks = [{ id: 1, description: 'Task 1' }];
            setupFetchMock({ content: mockTasks });

            const result = await taskService.getMyTasks();
            expect(result).toEqual(mockTasks);
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/tasks/assigned-to-me'),
                expect.objectContaining({ headers: expect.objectContaining({ 'Authorization': 'Bearer mock-token' }) })
            );
        });

        it('should fetch tasks handling direct array payload', async () => {
            const mockTasks = [{ id: 1, description: 'Task 1' }];
            setupFetchMock(mockTasks);

            const result = await taskService.getMyTasks();
            expect(result).toEqual(mockTasks);
        });

        it('should default to empty array if no matches', async () => {
            setupFetchMock({});
            const result = await taskService.getMyTasks();
            expect(result).toEqual([]);
        });

        it('should throw error on fetch failure', async () => {
            setupFetchMock(null, false);
            await expect(taskService.getMyTasks()).rejects.toThrow('Error al obtener las tareas asignadas.');
        });
    });

    describe('updateTaskStatus', () => {
        it('should update task status', async () => {
            const mockResponse = { id: 1, status: 'COMPLETED' };
            setupFetchMock(mockResponse);

            const result = await taskService.updateTaskStatus(1, { status: 'COMPLETED' } as any);
            expect(result).toEqual(mockResponse);
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/tasks/1/status'),
                expect.objectContaining({ method: 'PUT', body: JSON.stringify({ status: 'COMPLETED' }) })
            );
        });

        it('should throw error on status update failure', async () => {
            setupFetchMock(null, false);
            await expect(taskService.updateTaskStatus(1, { status: 'COMPLETED' } as any)).rejects.toThrow('Error al actualizar el estado de la tarea.');
        });
    });

    describe('getTasksCreatedByMe', () => {
        it('should fetch tasks handling content page payload', async () => {
            const mockTasks = [{ id: 1 }];
            setupFetchMock({ content: mockTasks });

            const result = await taskService.getTasksCreatedByMe();
            expect(result).toEqual(mockTasks);
        });

        it('should fetch tasks handling direct array', async () => {
            const mockTasks = [{ id: 1 }];
            setupFetchMock(mockTasks);

            const result = await taskService.getTasksCreatedByMe();
            expect(result).toEqual(mockTasks);
        });

        it('should send correct filters via query params', async () => {
            setupFetchMock([]);
            await taskService.getTasksCreatedByMe({ status: 'PENDING', farmId: '1', assignedToUserId: '2' });

            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/tasks/created-by-me?status=PENDING&farmId=1&userId=2'),
                expect.anything()
            );
        });

        it('should throw error on failure', async () => {
            setupFetchMock(null, false);
            await expect(taskService.getTasksCreatedByMe()).rejects.toThrow('Error al obtener las tareas creadas.');
        });
    });

    describe('createTask', () => {
        it('should create task successfully', async () => {
            const mockTask = { id: 1, description: 'New Task' };
            setupFetchMock(mockTask);

            const taskData = { description: 'New Task', sectorId: 1, assignedToUserId: 2 };
            const result = await taskService.createTask(taskData as any);

            expect(result).toEqual(mockTask);
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/tasks'),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({
                        description: 'New Task',
                        assignedToUserId: 2,
                        sectorId: 1
                    })
                })
            );
        });

        it('should throw parsed JSON message on creation failure', async () => {
            fetchMock.mockResolvedValueOnce({
                ok: false,
                text: async () => JSON.stringify({ message: 'Invalid data' }),
            });

            await expect(taskService.createTask({} as any)).rejects.toThrow('Invalid data');
        });

        it('should throw fallback error if JSON parsing fails', async () => {
            fetchMock.mockResolvedValueOnce({
                ok: false,
                text: async () => 'Non-JSON text',
            });

            await expect(taskService.createTask({} as any)).rejects.toThrow('El servidor tuvo un problema. Contacta al administrador.');
        });
    });
});
