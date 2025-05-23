
/**
 * Bazowe interfejsy dla komunikacji API
 */

// Bazowy interfejs odpowiedzi API
export interface ApiResponse<T = any> {
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
  };
  meta?: {
    count?: number;
    totalCount?: number;
    page?: number;
    totalPages?: number;
  };
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  orderBy?: string;
  orderDirection?: "asc" | "desc";
}

export interface FilterParams {
  search?: string;
  [key: string]: any;
}
