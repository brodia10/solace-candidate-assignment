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
  search: (term: string) => void;
  searchTerm: string;
}

export function useAdvocates(): UseAdvocatesReturn {
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchAdvocates = useCallback(
    async (page: number, limit: number, search: string) => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        if (search.trim()) {
          params.append("search", search.trim());
        }

        const response = await fetch(`/api/advocates?${params.toString()}`);

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
    [] // No dependencies to avoid circular updates
  );

  const goToPage = useCallback(
    (page: number) => {
      setCurrentPage(page);
      fetchAdvocates(page, pageSize, searchTerm);
    },
    [fetchAdvocates, pageSize, searchTerm]
  );

  const setPageSize = useCallback(
    (size: number) => {
      setPageSizeState(size);
      setCurrentPage(1);
      fetchAdvocates(1, size, searchTerm);
    },
    [fetchAdvocates, searchTerm]
  );

  const search = useCallback(
    (term: string) => {
      setSearchTerm(term);
      setCurrentPage(1);
      fetchAdvocates(1, pageSize, term);
    },
    [fetchAdvocates, pageSize]
  );

  // Initial load
  useEffect(() => {
    fetchAdvocates(currentPage, pageSize, searchTerm);
  }, []); // Only run once on mount

  return {
    advocates,
    pagination,
    loading,
    error,
    refetch: () => fetchAdvocates(currentPage, pageSize, searchTerm),
    goToPage,
    setPageSize,
    search,
    searchTerm,
  };
}
