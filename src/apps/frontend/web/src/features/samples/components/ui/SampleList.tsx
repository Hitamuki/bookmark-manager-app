'use client';

import { ErrorDisplay } from '@/components/ui/ErrorDisplay';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PAGINATION } from '@/constants/pagination';
import {
  useSampleControllerDeleteSampleById,
  useSampleControllerSearchSamples,
} from '@/libs/api-client/endpoints/samples/samples';
import type { SampleDto } from '@/libs/api-client/model';
import { Button, Pagination, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@heroui/react';
import { useQueryClient } from '@tanstack/react-query';
import { Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export const SampleList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const offset = (currentPage - 1) * PAGINATION.ITEMS_PER_PAGE;

  const { data, isLoading, isError, error } = useSampleControllerSearchSamples({
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

  // TODO: ローディングスケルトン検討
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return <ErrorDisplay message={error?.message} statusCode={error?.response?.status} />;
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
              <TableCell>{sample.title}</TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Link href={`/samples/${sample.id}`}>
                    <Button isIconOnly size="sm" variant="light" aria-label="Edit sample">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    isIconOnly
                    color="danger"
                    size="sm"
                    variant="light"
                    onPress={() => deleteMutation.mutateAsync({ id: sample.id })}
                    aria-label="Delete sample"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex justify-center">
        <Pagination isCompact showControls page={currentPage} total={totalPages} onChange={setCurrentPage} />
      </div>
    </div>
  );
};
