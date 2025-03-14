
import React, { useState, useEffect } from 'react';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationNext, 
  PaginationPrevious, 
  PaginationLink,
  PaginationEllipsis
} from '@/components/ui/pagination';
import { 
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PaginatedTableProps<T> {
  data: T[] | undefined;
  columns: {
    key: string;
    header: string;
    cell: (item: T) => React.ReactNode;
    sortable?: boolean;
  }[];
  isLoading: boolean;
  isError: boolean;
  pagination: {
    limit: number;
    offset: number;
    totalPages: number;
    currentPage: number;
  };
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  emptyState?: React.ReactNode;
  errorState?: React.ReactNode;
}

export function PaginatedTable<T>({
  data,
  columns,
  isLoading,
  isError,
  pagination,
  onPageChange,
  onPageSizeChange,
  onSort,
  emptyState,
  errorState
}: PaginatedTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  const handleSort = (column: string) => {
    if (onSort) {
      const newDirection = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
      setSortColumn(column);
      setSortDirection(newDirection);
      onSort(column, newDirection);
    }
  };
  
  // Generate visible page numbers
  const getPageNumbers = () => {
    const { totalPages, currentPage } = pagination;
    const delta = 1; // Number of pages to show on each side of current page
    const pages: (number | 'ellipsis')[] = [];
    
    if (totalPages <= 7) {
      // Show all pages if there are 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always add first page
      pages.push(1);
      
      // Add ellipsis if needed
      if (currentPage > 2 + delta) {
        pages.push('ellipsis');
      }
      
      // Add pages around current page
      const rangeStart = Math.max(2, currentPage - delta);
      const rangeEnd = Math.min(totalPages - 1, currentPage + delta);
      
      for (let i = rangeStart; i <= rangeEnd; i++) {
        pages.push(i);
      }
      
      // Add ellipsis if needed
      if (currentPage < totalPages - (1 + delta)) {
        pages.push('ellipsis');
      }
      
      // Always add last page if there's more than one page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };
  
  if (isError) {
    return errorState || (
      <div className="flex items-center justify-center p-8 bg-muted/30 rounded-md">
        <div className="text-center">
          <p className="text-muted-foreground">Error loading data</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead 
                  key={column.key} 
                  className={column.sortable ? 'cursor-pointer' : ''}
                  onClick={column.sortable ? () => handleSort(column.key) : undefined}
                >
                  <div className="flex items-center">
                    {column.header}
                    {column.sortable && sortColumn === column.key && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading state
              Array(pagination.limit)
                .fill(null)
                .map((_, index) => (
                  <TableRow key={index}>
                    {columns.map((column) => (
                      <TableCell key={column.key}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
            ) : data && data.length > 0 ? (
              // Data rows
              data.map((item, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell key={column.key}>{column.cell(item)}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              // Empty state
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center">
                  {emptyState || (
                    <div className="flex justify-center items-center h-full">
                      <p className="text-muted-foreground">No data found</p>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <p className="text-sm text-muted-foreground">
            Rows per page
          </p>
          <Select
            value={pagination.limit.toString()}
            onValueChange={(value) => onPageSizeChange(parseInt(value, 10))}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pagination.limit.toString()} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  if (pagination.currentPage > 1) {
                    onPageChange(pagination.currentPage - 1);
                  }
                }} 
                aria-disabled={pagination.currentPage <= 1}
                className={pagination.currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
            
            {getPageNumbers().map((page, i) => (
              <PaginationItem key={i}>
                {page === 'ellipsis' ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      onPageChange(page);
                    }}
                    isActive={page === pagination.currentPage}
                  >
                    {page}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  if (pagination.currentPage < pagination.totalPages) {
                    onPageChange(pagination.currentPage + 1);
                  }
                }} 
                aria-disabled={pagination.currentPage >= pagination.totalPages}
                className={pagination.currentPage >= pagination.totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
