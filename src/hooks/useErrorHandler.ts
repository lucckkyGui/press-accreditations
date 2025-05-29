
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface RetryConfig {
  maxRetries: number;
  delay: number;
  backoff: boolean;
}

interface ErrorState {
  error: Error | null;
  retryCount: number;
  isRetrying: boolean;
}

export const useErrorHandler = (defaultRetryConfig?: Partial<RetryConfig>) => {
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    retryCount: 0,
    isRetrying: false
  });

  const config: RetryConfig = {
    maxRetries: 3,
    delay: 1000,
    backoff: true,
    ...defaultRetryConfig
  };

  const executeWithRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    operationName: string = 'Operation',
    customConfig?: Partial<RetryConfig>
  ): Promise<T> => {
    const finalConfig = { ...config, ...customConfig };
    let lastError: Error;

    setErrorState(prev => ({ ...prev, isRetrying: true, retryCount: 0 }));

    for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
      try {
        const result = await operation();
        
        // Success - reset error state
        setErrorState({ error: null, retryCount: 0, isRetrying: false });
        
        if (attempt > 0) {
          toast.success(`${operationName} succeeded after ${attempt} retries`);
        }
        
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        setErrorState(prev => ({
          ...prev,
          error: lastError,
          retryCount: attempt + 1
        }));

        // Don't retry on the last attempt
        if (attempt === finalConfig.maxRetries) {
          break;
        }

        // Calculate delay with optional backoff
        const delay = finalConfig.backoff 
          ? finalConfig.delay * Math.pow(2, attempt)
          : finalConfig.delay;

        console.warn(`${operationName} failed (attempt ${attempt + 1}), retrying in ${delay}ms:`, lastError.message);
        
        toast.warning(`${operationName} failed, retrying... (${attempt + 1}/${finalConfig.maxRetries})`);

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // All retries failed
    setErrorState(prev => ({ ...prev, isRetrying: false }));
    toast.error(`${operationName} failed after ${finalConfig.maxRetries} retries: ${lastError!.message}`);
    throw lastError!;
  }, [config]);

  const clearError = useCallback(() => {
    setErrorState({ error: null, retryCount: 0, isRetrying: false });
  }, []);

  const handleError = useCallback((error: Error, context: string = 'Unknown') => {
    console.error(`Error in ${context}:`, error);
    setErrorState(prev => ({ ...prev, error }));
    toast.error(`Error in ${context}: ${error.message}`);
  }, []);

  return {
    executeWithRetry,
    clearError,
    handleError,
    error: errorState.error,
    retryCount: errorState.retryCount,
    isRetrying: errorState.isRetrying
  };
};
