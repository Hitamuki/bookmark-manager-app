'use client';

import { useSampleControllerSearchSamples } from '@/libs/api-client/endpoints/samples/samples';
import { useSampleControllerDeleteSampleById } from '@/libs/api-client/endpoints/samples/samples';
import type { SampleDto } from '@/libs/api-client/model';
import { Button } from '@/libs/ui/shadcn/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/libs/ui/shadcn/components/ui/pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/libs/ui/shadcn/components/ui/table';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';

const ITEMS_PER_PAGE = 10;

export const SampleList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useSampleControllerSearchSamples({
    limit: ITEMS_PER_PAGE,
    offset: (currentPage - 1) * ITEMS_PER_PAGE,
  });

  const deleteMutation = useSampleControllerDeleteSampleById({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/samples'] });
      },
    },
  });

  if (isLoading) {
    return <div className="text-center">Loading samples...</div>;
  }

  if (isError) {
    return <div className="text-center text-red-500">Error fetching samples.</div>;
  }

  const samples = data?.data.data ?? [];
  const totalItems = data?.data.total ?? 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {samples.length > 0 ? (
            samples.map((sample: SampleDto) => (
              <TableRow key={sample.id}>
                <TableCell className="font-medium">
                  <Link href={`/samples/${sample.id}`} className="text-blue-600">
                    {sample.title}
                  </Link>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      deleteMutation.mutateAsync({ id: sample.id });
                    }}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={2} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" onClick={() => handlePageChange(Math.max(1, currentPage - 1))} />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => (
              <PaginationItem key={`page-${i + 1}`}>
                <PaginationLink href="#" isActive={currentPage === i + 1} onClick={() => handlePageChange(i + 1)}>
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext href="#" onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};
