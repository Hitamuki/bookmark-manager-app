'use client';

import { PAGINATION } from '@/constants/pagination';
import {
  useSampleControllerDeleteSampleById,
  useSampleControllerSearchSamples,
} from '@/libs/api-client/endpoints/samples/samples';
import type { SampleDto } from '@/libs/api-client/model';
import { Button } from '@heroui/button';
import { Pagination } from '@heroui/pagination';
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@heroui/table';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';

export const SampleList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const offset = (currentPage - 1) * PAGINATION.ITEMS_PER_PAGE;

  const { data, isLoading, isError } = useSampleControllerSearchSamples({
    limit: PAGINATION.ITEMS_PER_PAGE,
    offset,
  });

  const queryClient = useQueryClient();
  const deleteMutation = useSampleControllerDeleteSampleById({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/samples'] });
      },
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error fetching data</div>;
  }

  const samples = data?.data.data || [];
  const totalPages = Math.ceil((data?.data.total || 0) / PAGINATION.ITEMS_PER_PAGE);

  return (
    <div className="space-y-4">
      <Table aria-label="Sample list table">
        <TableHeader>
          <TableColumn>Title</TableColumn>
          <TableColumn>Actions</TableColumn>
        </TableHeader>
        <TableBody>
          {samples.map((sample: SampleDto) => (
            <TableRow key={sample.id}>
              <TableCell>
                <Link href={`/samples/${sample.id}`} className="text-blue-600 hover:underline">
                  {sample.title}
                </Link>
              </TableCell>
              <TableCell>
                <Button color="danger" size="sm" onPress={() => deleteMutation.mutateAsync({ id: sample.id })}>
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Pagination isCompact showControls page={currentPage} total={totalPages} onChange={setCurrentPage} />
    </div>
  );
};
