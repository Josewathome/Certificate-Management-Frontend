
import { useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export interface PaginationState {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startIndex: number;
  endIndex: number;
}

export interface UsePaginationOptions {
  initialPage?: number;
  itemsPerPage?: number;
  totalItems?: number;
  urlSync?: boolean;
  pageParam?: string;
}

export interface UsePaginationReturn extends PaginationState {
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  setItemsPerPage: (items: number) => void;
  setTotalItems: (total: number) => void;
  getPageNumbers: (maxVisible?: number) => (number | 'ellipsis')[];
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const usePagination = ({
  initialPage = 1,
  itemsPerPage: initialItemsPerPage = 10,
  totalItems: initialTotalItems = 0,
  urlSync = true,
  pageParam = 'page'
}: UsePaginationOptions = {}): UsePaginationReturn => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [itemsPerPage, setItemsPerPageState] = useState(initialItemsPerPage);
  const [totalItems, setTotalItemsState] = useState(initialTotalItems);
  const [isLoading, setIsLoading] = useState(false);

  // Get current page from URL or state
  const currentPage = useMemo(() => {
    if (urlSync) {
      const pageFromUrl = parseInt(searchParams.get(pageParam) || '1', 10);
      return isNaN(pageFromUrl) || pageFromUrl < 1 ? 1 : pageFromUrl;
    }
    return initialPage;
  }, [searchParams, urlSync, pageParam, initialPage]);

  // Calculate pagination state
  const paginationState = useMemo(() => {
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const safePage = Math.min(currentPage, totalPages);
    const startIndex = (safePage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

    return {
      currentPage: safePage,
      totalItems,
      itemsPerPage,
      totalPages,
      hasNextPage: safePage < totalPages,
      hasPreviousPage: safePage > 1,
      startIndex,
      endIndex,
    };
  }, [currentPage, totalItems, itemsPerPage]);

  // Update URL when page changes
  const updateUrl = useCallback((page: number) => {
    if (urlSync) {
      const newParams = new URLSearchParams(searchParams);
      if (page === 1) {
        newParams.delete(pageParam);
      } else {
        newParams.set(pageParam, page.toString());
      }
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams, urlSync, pageParam]);

  // Navigation functions
  const goToPage = useCallback((page: number) => {
    const clampedPage = Math.max(1, Math.min(page, paginationState.totalPages));
    updateUrl(clampedPage);
  }, [paginationState.totalPages, updateUrl]);

  const nextPage = useCallback(() => {
    if (paginationState.hasNextPage) {
      goToPage(paginationState.currentPage + 1);
    }
  }, [paginationState.hasNextPage, paginationState.currentPage, goToPage]);

  const previousPage = useCallback(() => {
    if (paginationState.hasPreviousPage) {
      goToPage(paginationState.currentPage - 1);
    }
  }, [paginationState.hasPreviousPage, paginationState.currentPage, goToPage]);

  const goToFirstPage = useCallback(() => goToPage(1), [goToPage]);

  const goToLastPage = useCallback(() => goToPage(paginationState.totalPages), [goToPage, paginationState.totalPages]);

  const setItemsPerPage = useCallback((items: number) => {
    setItemsPerPageState(items);
    goToFirstPage(); // Reset to first page when changing items per page
  }, [goToFirstPage]);

  const setTotalItems = useCallback((total: number) => {
    setTotalItemsState(total);
  }, []);

  // Generate page numbers with ellipsis
  const getPageNumbers = useCallback((maxVisible: number = 7) => {
    const { totalPages, currentPage } = paginationState;
    
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | 'ellipsis')[] = [];
    const halfVisible = Math.floor(maxVisible / 2);

    if (currentPage <= halfVisible + 1) {
      // Show first pages
      for (let i = 1; i <= maxVisible - 2; i++) {
        pages.push(i);
      }
      pages.push('ellipsis');
      pages.push(totalPages);
    } else if (currentPage >= totalPages - halfVisible) {
      // Show last pages
      pages.push(1);
      pages.push('ellipsis');
      for (let i = totalPages - maxVisible + 3; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show middle pages
      pages.push(1);
      pages.push('ellipsis');
      for (let i = currentPage - halfVisible + 1; i <= currentPage + halfVisible - 1; i++) {
        pages.push(i);
      }
      pages.push('ellipsis');
      pages.push(totalPages);
    }

    return pages;
  }, [paginationState]);

  return {
    ...paginationState,
    goToPage,
    nextPage,
    previousPage,
    goToFirstPage,
    goToLastPage,
    setItemsPerPage,
    setTotalItems,
    getPageNumbers,
    isLoading,
    setIsLoading,
  };
};
