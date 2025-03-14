
import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { supabaseClient, handleSupabaseError, retryOperation } from '@/lib/supabase-client';
import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { toast } from 'sonner';

type QueryFn<T> = () => Promise<T>;
type MutationFn<T, V> = (variables: V) => Promise<T>;

/**
 * Creates a hook for querying data with proper caching, loading states, and error handling
 */
export function createQueryHook<T>(
  queryKey: string | (string | unknown)[],
  queryFn: QueryFn<T>,
  options: {
    staleTime?: number;
    refetchOnWindowFocus?: boolean;
    enabled?: boolean;
  } = {}
) {
  return (customOptions: Partial<UseQueryOptions<T, Error>> = {}) => {
    const defaultOptions = {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: true,
      enabled: true,
      retry: 2,
      ...options,
    };

    return useQuery<T, Error>({
      queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
      queryFn: async () => {
        try {
          return await retryOperation(queryFn);
        } catch (error) {
          handleSupabaseError(error as Error, `Failed to fetch ${Array.isArray(queryKey) ? queryKey[0] : queryKey} data`);
          throw error;
        }
      },
      ...defaultOptions,
      ...customOptions,
    });
  };
}

/**
 * Creates a hook for mutations with optimistic updates
 */
export function createMutationHook<T, V>(
  queryKey: string | (string | ((variables: any) => any))[],
  mutationFn: MutationFn<T, V>,
  options: {
    optimisticUpdate?: (variables: V, oldData: any) => any;
    onSuccessMessage?: string;
    invalidateQueries?: (string | (string | ((variables: any) => any))[])[]; 
  } = {}
) {
  return (
    customOptions: Partial<UseMutationOptions<T, Error, V>> = {}
  ) => {
    const queryClient = useQueryClient();
    const queryKeyArray = Array.isArray(queryKey) ? queryKey : [queryKey];
    
    return useMutation<T, Error, V>({
      mutationFn: async (variables) => {
        try {
          return await retryOperation(() => mutationFn(variables));
        } catch (error) {
          handleSupabaseError(error as Error, 'Operation failed');
          throw error;
        }
      },
      onMutate: async (variables) => {
        if (options.optimisticUpdate) {
          // Cancel any outgoing refetches
          await queryClient.cancelQueries({ queryKey: queryKeyArray });
          
          // Snapshot the previous value
          const previousData = queryClient.getQueryData(queryKeyArray);
          
          // Optimistically update to the new value
          queryClient.setQueryData(queryKeyArray, (old: any) => 
            options.optimisticUpdate ? options.optimisticUpdate(variables, old) : old
          );
          
          // Return a context object with the previous data
          return { previousData };
        }
      },
      onSuccess: (data, variables, context) => {
        if (options.onSuccessMessage) {
          toast.success(options.onSuccessMessage);
        }
        
        // Invalidate related queries if specified
        const queriesToInvalidate = [
          queryKeyArray,
          ...(options.invalidateQueries || []).map(key => 
            Array.isArray(key) ? key : [key]
          )
        ];
        
        queriesToInvalidate.forEach(key => {
          queryClient.invalidateQueries({ queryKey: key });
        });
        
        if (customOptions.onSuccess) {
          customOptions.onSuccess(data, variables, context);
        }
      },
      onError: (error, variables, context: any) => {
        // Rollback to the previous value
        if (options.optimisticUpdate && context) {
          queryClient.setQueryData(queryKeyArray, context.previousData);
        }
        
        if (customOptions.onError) {
          customOptions.onError(error, variables, context);
        }
      },
      ...customOptions,
    });
  };
}

/**
 * Converts Supabase query builder to a query function
 */
export function queryBuilderToQueryFn<T>(
  queryBuilder: PostgrestFilterBuilder<any, any, any>
): () => Promise<T[]> {
  return async () => {
    const { data, error } = await queryBuilder;
    
    if (error) {
      handleSupabaseError(error, 'Database query failed');
      throw error;
    }
    
    return data as T[];
  };
}
