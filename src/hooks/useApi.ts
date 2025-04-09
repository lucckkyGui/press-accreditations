
import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiResponse } from '@/types/supabase';

/**
 * Hook ułatwiający korzystanie z API
 * Będzie używany po zintegrowaniu projektu z Supabase
 */
interface UseApiOptions<TData = any, TParams = any> {
  onSuccess?: (data: TData) => void;
  onError?: (error: any) => void;
  enabled?: boolean;
}

interface UseApiResponse<TData = any, TParams = any> {
  fetch: (params?: TParams) => Promise<ApiResponse<TData>>;
  data?: TData;
  isLoading: boolean;
  isError: boolean;
  error: any;
  refetch: () => void;
}

interface UseApiMutationResponse<TData = any, TParams = any> {
  mutate: (params: TParams) => void;
  mutateAsync: (params: TParams) => Promise<ApiResponse<TData>>;
  isLoading: boolean;
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
      const response = await fetchFn(params);
      if (response.error) {
        throw new Error(response.error.message);
      }
      return response.data;
    },
    enabled: options?.enabled !== false,
    meta: {
      onSuccess: options?.onSuccess,
      onError: options?.onError
    },
  });

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
    mutate,
    mutateAsync,
    isLoading,
    isError,
    error,
    reset,
    data
  } = useMutation({
    mutationKey: mutationKeyArray,
    mutationFn: async (params: TParams) => {
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

  return {
    mutate,
    mutateAsync,
    isLoading,
    isError,
    error,
    reset,
    data,
  };
}
