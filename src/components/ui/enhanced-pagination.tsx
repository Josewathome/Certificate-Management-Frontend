
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UsePaginationReturn } from '@/hooks/usePagination';

interface EnhancedPaginationProps {
  pagination: UsePaginationReturn;
  showItemsPerPage?: boolean;
  showInfo?: boolean;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  itemsPerPageOptions?: number[];
}

export const EnhancedPagination: React.FC<EnhancedPaginationProps> = ({
  pagination,
  showItemsPerPage = true,
  showInfo = true,
  className,
  size = 'default',
  itemsPerPageOptions = [5, 10, 20, 50, 100]
}) => {
  const {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    hasNextPage,
    hasPreviousPage,
    startIndex,
    endIndex,
    goToPage,
    nextPage,
    previousPage,
    goToFirstPage,
    goToLastPage,
    setItemsPerPage,
    getPageNumbers,
    isLoading
  } = pagination;

  const pageNumbers = getPageNumbers();

  const buttonSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default';
  const iconSize = size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';

  if (totalPages <= 1 && !showInfo && !showItemsPerPage) {
    return null;
  }

  return (
    <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between', className)}>
      {/* Items per page and info */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        {showItemsPerPage && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Items per page:</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => setItemsPerPage(parseInt(value, 10))}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {itemsPerPageOptions.map((option) => (
                  <SelectItem key={option} value={option.toString()}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {showInfo && totalItems > 0 && (
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {endIndex} of {totalItems} results
          </div>
        )}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          {/* First page */}
          <Button
            variant="outline"
            size={buttonSize}
            onClick={goToFirstPage}
            disabled={!hasPreviousPage || isLoading}
            className="hidden sm:flex"
          >
            <ChevronsLeft className={iconSize} />
          </Button>

          {/* Previous page */}
          <Button
            variant="outline"
            size={buttonSize}
            onClick={previousPage}
            disabled={!hasPreviousPage || isLoading}
          >
            <ChevronLeft className={iconSize} />
            <span className="hidden sm:inline ml-1">Previous</span>
          </Button>

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {pageNumbers.map((pageNumber, index) => (
              pageNumber === 'ellipsis' ? (
                <div
                  key={`ellipsis-${index}`}
                  className="flex h-9 w-9 items-center justify-center"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </div>
              ) : (
                <Button
                  key={pageNumber}
                  variant={currentPage === pageNumber ? 'default' : 'outline'}
                  size={buttonSize}
                  onClick={() => goToPage(pageNumber)}
                  disabled={isLoading}
                  className={cn(
                    'min-w-9',
                    currentPage === pageNumber && 'bg-primary text-primary-foreground'
                  )}
                >
                  {isLoading && currentPage === pageNumber ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    pageNumber
                  )}
                </Button>
              )
            ))}
          </div>

          {/* Next page */}
          <Button
            variant="outline"
            size={buttonSize}
            onClick={nextPage}
            disabled={!hasNextPage || isLoading}
          >
            <span className="hidden sm:inline mr-1">Next</span>
            <ChevronRight className={iconSize} />
          </Button>

          {/* Last page */}
          <Button
            variant="outline"
            size={buttonSize}
            onClick={goToLastPage}
            disabled={!hasNextPage || isLoading}
            className="hidden sm:flex"
          >
            <ChevronsRight className={iconSize} />
          </Button>
        </div>
      )}
    </div>
  );
};
