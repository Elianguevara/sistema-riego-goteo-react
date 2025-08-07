// Archivo: src/types/audit.types.ts

// Interface para la respuesta de un único registro de cambio
export interface ChangeHistoryResponse {
    id: number;
    changeDatetime: string;
    actionType: 'CREATE' | 'UPDATE' | 'DELETE';
    affectedTable: string;
    recordId: number;
    fieldName: string | null;
    oldValue: string | null;
    newValue: string | null;
    userId: number;
    username: string;
}

// Interface genérica para la respuesta paginada de la API
export interface Page<T> {
    content: T[];
    pageable: {
        pageNumber: number;
        pageSize: number;
        sort: {
            sorted: boolean;
            unsorted: boolean;
            empty: boolean;
        };
        offset: number;
        paged: boolean;
        unpaged: boolean;
    };
    last: boolean;
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    sort: {
        sorted: boolean;
        unsorted: boolean;
        empty: boolean;
    };
    first: boolean;
    numberOfElements: number;
    empty: boolean;
}

// Interface para los parámetros de la solicitud de historial
export interface ChangeHistoryRequestParams {
    page?: number;
    size?: number;
    sort?: string;
    userId?: number | string;
    affectedTable?: string;
    actionType?: string;
    searchTerm?: string;
    startDate?: string;
    endDate?: string;
}