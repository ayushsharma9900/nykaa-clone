'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  pageSizeOptions?: number[];
  updateURL?: boolean;
  maxPages?: number;
}

export interface PaginationHookReturn {
  paginationState: PaginationState;
  goToPage: (page: number) => void;
  goToNextPage: () => void;
  goToPrevPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  changePageSize: (pageSize: number) => void;
  updateTotalItems: (totalItems: number) => void;
  reset: () => void;
  getVisiblePages: () => (number | string)[];
  getStartEndItems: () => { start: number; end: number };
}

export function usePagination({
  initialPage = 1,
  initialPageSize = 20,
  pageSizeOptions = [10, 20, 50, 100],
  updateURL = true,
  maxPages = 10
}: PaginationOptions = {}): PaginationHookReturn {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Get initial values from URL params if updateURL is enabled
  const getInitialPage = () => {
    if (updateURL) {
      const pageParam = searchParams.get('page');
      return pageParam ? parseInt(pageParam) : initialPage;
    }
    return initialPage;
  };

  const getInitialPageSize = () => {
    if (updateURL) {
      const limitParam = searchParams.get('limit');
      return limitParam ? parseInt(limitParam) : initialPageSize;
    }
    return initialPageSize;
  };

  const [currentPage, setCurrentPage] = useState(getInitialPage);
  const [pageSize, setPageSize] = useState(getInitialPageSize);
  const [totalItems, setTotalItems] = useState(0);

  // Calculate derived values
  const paginationState = useMemo((): PaginationState => {
    const totalPages = Math.ceil(totalItems / pageSize);
    return {
      currentPage,
      pageSize,
      totalItems,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1
    };
  }, [currentPage, pageSize, totalItems]);

  // Update URL when pagination changes
  const updateURLParams = useCallback((newPage: number, newPageSize?: number) => {
    if (!updateURL) return;

    const params = new URLSearchParams(searchParams.toString());
    
    // Update page
    if (newPage === 1) {
      params.delete('page');
    } else {
      params.set('page', newPage.toString());
    }
    
    // Update page size if provided
    if (newPageSize !== undefined) {
      if (newPageSize === initialPageSize) {
        params.delete('limit');
      } else {
        params.set('limit', newPageSize.toString());
      }
    }

    const queryString = params.toString();
    const newURL = queryString ? `${pathname}?${queryString}` : pathname;
    
    router.replace(newURL, { scroll: false });
  }, [updateURL, searchParams, pathname, router, initialPageSize]);

  // Navigation functions
  const goToPage = useCallback((page: number) => {
    const validPage = Math.max(1, Math.min(page, paginationState.totalPages));
    setCurrentPage(validPage);
    updateURLParams(validPage);
  }, [paginationState.totalPages, updateURLParams]);

  const goToNextPage = useCallback(() => {
    if (paginationState.hasNextPage) {
      goToPage(currentPage + 1);
    }
  }, [currentPage, paginationState.hasNextPage, goToPage]);

  const goToPrevPage = useCallback(() => {
    if (paginationState.hasPrevPage) {
      goToPage(currentPage - 1);
    }
  }, [currentPage, paginationState.hasPrevPage, goToPage]);

  const goToFirstPage = useCallback(() => {
    goToPage(1);
  }, [goToPage]);

  const goToLastPage = useCallback(() => {
    goToPage(paginationState.totalPages);
  }, [paginationState.totalPages, goToPage]);

  const changePageSize = useCallback((newPageSize: number) => {
    if (!pageSizeOptions.includes(newPageSize)) {
      console.warn(`Page size ${newPageSize} is not in allowed options:`, pageSizeOptions);
      return;
    }

    setPageSize(newPageSize);
    // Reset to first page when changing page size to avoid showing empty results
    setCurrentPage(1);
    updateURLParams(1, newPageSize);
  }, [pageSizeOptions, updateURLParams]);

  const updateTotalItems = useCallback((newTotalItems: number) => {
    setTotalItems(Math.max(0, newTotalItems));
    
    // If current page is beyond the new total pages, go to last valid page
    const newTotalPages = Math.ceil(newTotalItems / pageSize);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      goToPage(newTotalPages);
    }
  }, [currentPage, pageSize, goToPage]);

  const reset = useCallback(() => {
    setCurrentPage(initialPage);
    setPageSize(initialPageSize);
    setTotalItems(0);
    if (updateURL) {
      updateURLParams(initialPage, initialPageSize);
    }
  }, [initialPage, initialPageSize, updateURL, updateURLParams]);

  // Get visible page numbers with ellipsis
  const getVisiblePages = useCallback((): (number | string)[] => {
    const { totalPages } = paginationState;
    
    if (totalPages <= maxPages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];
    const sidePages = Math.floor((maxPages - 3) / 2); // Reserve space for first, last, and ellipsis

    // Always show first page
    pages.push(1);

    if (currentPage <= sidePages + 2) {
      // Near beginning
      for (let i = 2; i <= Math.min(maxPages - 1, totalPages - 1); i++) {
        pages.push(i);
      }
      if (totalPages > maxPages - 1) {
        pages.push('...');
      }
    } else if (currentPage >= totalPages - sidePages - 1) {
      // Near end
      if (totalPages > maxPages - 1) {
        pages.push('...');
      }
      for (let i = Math.max(2, totalPages - maxPages + 2); i <= totalPages - 1; i++) {
        pages.push(i);
      }
    } else {
      // In middle
      pages.push('...');
      for (let i = currentPage - sidePages; i <= currentPage + sidePages; i++) {
        pages.push(i);
      }
      pages.push('...');
    }

    // Always show last page if there's more than one page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  }, [paginationState, currentPage, maxPages]);

  // Get start and end item numbers for display
  const getStartEndItems = useCallback(() => {
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalItems);
    return { start: Math.max(start, 0), end: Math.max(end, 0) };
  }, [currentPage, pageSize, totalItems]);

  return {
    paginationState,
    goToPage,
    goToNextPage,
    goToPrevPage,
    goToFirstPage,
    goToLastPage,
    changePageSize,
    updateTotalItems,
    reset,
    getVisiblePages,
    getStartEndItems
  };
}

export default usePagination;
