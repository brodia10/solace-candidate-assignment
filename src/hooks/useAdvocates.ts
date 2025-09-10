import { useState, useEffect, useCallback } from "react";
import {
  Advocate,
  PaginatedApiResponse,
  PaginationInfo,
} from "../types/advocate";

interface UseAdvocatesReturn {
  advocates: Advocate[];
  pagination: PaginationInfo | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  goToPage: (page: number) => void;
  setPageSize: (size: number) => void;
}

export function useAdvocates(): UseAdvocatesReturn {
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(10);

  const fetchAdvocates = useCallback(
    async (page: number = currentPage, limit: number = pageSize) => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/advocates?page=${page}&limit=${limit}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: PaginatedApiResponse<Advocate[]> = await response.json();

        if (result.error) {
          throw new Error(result.error);
        }

        setAdvocates(result.data);
        setPagination(result.pagination);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch advocates"
        );
        console.error("Error fetching advocates:", err);
      } finally {
        setLoading(false);
      }
    },
    [currentPage, pageSize]
  );

  const goToPage = (page: number) => {
    setCurrentPage(page);
    fetchAdvocates(page, pageSize);
  };

  const setPageSize = (size: number) => {
    setPageSizeState(size);
    setCurrentPage(1);
    fetchAdvocates(1, size);
  };

  useEffect(() => {
    fetchAdvocates();
  }, [fetchAdvocates]);

  return {
    advocates,
    pagination,
    loading,
    error,
    refetch: () => fetchAdvocates(currentPage, pageSize),
    goToPage,
    setPageSize,
  };
}
