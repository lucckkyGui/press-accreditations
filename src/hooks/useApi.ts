
import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiResponse } from '@/types/supabase';
import { MigrationService } from '@/services/migration/migrationService';

/**
 * Hook ułatwiający korzystanie z API
 * Będzie używany po zintegrowaniu projektu z Supabase
 */
interface UseApiOptions<TData = any, TParams = any> {
  onSuccess?: (data: TData) => void;
  onError?: (error: any) => void;
  enabled?: boolean;
  offlineSupport?: boolean;  // Nowa opcja do obsługi trybu offline
}

interface UseApiResponse<TData = any, TParams = any> {
  fetch: (params?: TParams) => Promise<ApiResponse<TData>>;
  data?: TData;
  isLoading: boolean;
  isError: boolean;
  error: any;
  refetch: () => void;
}

// Update the interface to support both isLoading and isPending for compatibility
interface UseApiMutationResponse<TData = any, TParams = any> {
  mutate: (params: TParams) => void;
  mutateAsync: (params: TParams) => Promise<ApiResponse<TData>>;
  isLoading: boolean; // We'll map isPending to this
  isError: boolean;
  error: any;
  reset: () => void;
  data?: TData;
}

/**
 * Hook do obsługi GET requestów
 */
export function useApiQuery<TData = any, TParams = any>(
  queryKey: string | string[],
  fetchFn: (params?: TParams) => Promise<ApiResponse<TData>>,
  params?: TParams,
  options?: UseApiOptions<TData, TParams>
): UseApiResponse<TData, TParams> {
  const queryKeyArray = Array.isArray(queryKey) ? queryKey : [queryKey];
  const finalQueryKey = params ? [...queryKeyArray, params] : queryKeyArray;

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: finalQueryKey,
    queryFn: async () => {
      try {
        const response = await fetchFn(params);
        if (response.error) {
          throw new Error(response.error.message);
        }
        return response.data;
      } catch (err) {
        // Jeśli brak połączenia i włączone offline support, spróbuj pobrać z localStorage
        if (!navigator.onLine && options?.offlineSupport) {
          const cacheKey = `cache_${queryKeyArray.join('_')}_${JSON.stringify(params || {})}`;
          const cachedData = localStorage.getItem(cacheKey);
          if (cachedData) {
            console.log(`Returning cached data for ${queryKeyArray.join('_')}`);
            return JSON.parse(cachedData);
          }
        }
        throw err;
      }
    },
    enabled: options?.enabled !== false,
    meta: {
      onSuccess: options?.onSuccess,
      onError: options?.onError
    },
  });

  // Zapisz dane do lokalnego cache jeśli offlineSupport jest włączony
  React.useEffect(() => {
    if (data && options?.offlineSupport) {
      const cacheKey = `cache_${queryKeyArray.join('_')}_${JSON.stringify(params || {})}`;
      localStorage.setItem(cacheKey, JSON.stringify(data));
    }
  }, [data, params, queryKeyArray, options?.offlineSupport]);

  const fetch = useCallback(
    async (newParams?: TParams) => {
      return fetchFn(newParams || params);
    },
    [fetchFn, params]
  );

  return {
    fetch,
    data,
    isLoading,
    isError,
    error,
    refetch,
  };
}

/**
 * Hook do obsługi POST/PUT/DELETE requestów
 */
export function useApiMutation<TData = any, TParams = any>(
  mutationKey: string | string[],
  mutationFn: (params: TParams) => Promise<ApiResponse<TData>>,
  options?: UseApiOptions<TData, TParams>
): UseApiMutationResponse<TData, TParams> {
  const queryClient = useQueryClient();
  const mutationKeyArray = Array.isArray(mutationKey) ? mutationKey : [mutationKey];

  const {
    mutate: originalMutate,
    mutateAsync: originalMutateAsync,
    isPending,
    isError,
    error,
    reset,
    data
  } = useMutation({
    mutationKey: mutationKeyArray,
    mutationFn: async (params: TParams) => {
      // Sprawdź czy jest połączenie z internetem
      if (!navigator.onLine && options?.offlineSupport) {
        // Jeśli brak połączenia, zapisz operację do późniejszej synchronizacji
        const entity = mutationKeyArray[0];
        const operationType = mutationKeyArray[1] || "create";
        const entityId = (params as any)?.id || `temp_${Date.now()}`;
        
        MigrationService.saveOperation({
          type: operationType as any,
          entity: entity as any,
          entityId,
          data: params
        });
        
        // Zwróć symulowaną odpowiedź, aby aplikacja mogła działać dalej
        console.log(`Offline operation queued: ${operationType} - ${entity}`);
        return { data: params } as ApiResponse<TData>;
      }
      
      // Jeśli jest połączenie, wykonaj normalną operację
      const response = await mutationFn(params);
      if (response.error) {
        throw new Error(response.error.message);
      }
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate query cache for related queries
      queryClient.invalidateQueries({ queryKey: [mutationKeyArray[0]] });
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });

  // Owijamy oryginalną funkcję mutate, aby obsługiwać tryb offline
  const mutate = (params: TParams) => {
    originalMutate(params);
  };

  // Owijamy oryginalną funkcję mutateAsync, aby obsługiwać tryb offline
  const mutateAsync = async (params: TParams): Promise<ApiResponse<TData>> => {
    try {
      const result = await originalMutateAsync(params);
      return { data: result } as ApiResponse<TData>;
    } catch (err) {
      return { 
        error: { 
          message: err instanceof Error ? err.message : 'Unknown error',
          code: 'MUTATION_ERROR'
        } 
      } as ApiResponse<TData>;
    }
  };

  return {
    mutate,
    mutateAsync,
    isLoading: isPending,
    isError,
    error,
    reset,
    data,
  };
}
