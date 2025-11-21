/**
 * サンプル一覧コンポーネント
 * UIコンポーネント
 */
'use client';

import { Button, Pagination, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@heroui/react';
import { useQueryClient } from '@tanstack/react-query';
import * as Sentry from '@sentry/nextjs';
import { Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PAGINATION } from '@/constants/pagination';
import {
  useSampleControllerDeleteSampleById,
  useSampleControllerSearchSamples,
} from '@/libs/api-client/endpoints/samples/samples';
import type { SampleDto } from '@/libs/api-client/model';

/**
 * SampleList関数
 */
export const SampleList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const offset = (currentPage - 1) * PAGINATION.ITEMS_PER_PAGE;

  // Sentryテストモード（trueにするとエラーをスローして削除を実行しない）
  const [isSentryTestMode, setIsSentryTestMode] = useState(false);

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
      onError: (error) => {
        // Sentryにエラーを送信
        Sentry.captureException(error, {
          tags: {
            feature: 'sample-delete',
            component: 'SampleList',
          },
          extra: {
            sampleId: error.config?.url,
          },
        });
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
      <div className="flex justify-end">
        <Button
          size="sm"
          color={isSentryTestMode ? 'warning' : 'default'}
          variant="flat"
          onPress={() => setIsSentryTestMode(!isSentryTestMode)}
        >
          {isSentryTestMode ? 'Sentryテストモード: ON' : 'Sentryテストモード: OFF'}
        </Button>
      </div>
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
                    onPress={async () => {
                      if (isSentryTestMode) {
                        // テストモード: 意図的にエラーを発生させて削除は実行しない
                        const testError = new Error('[TEST] Sample delete error for Sentry testing');
                        Sentry.captureException(testError, {
                          tags: {
                            feature: 'sample-delete',
                            component: 'SampleList',
                            test: 'true',
                          },
                          extra: {
                            sampleId: sample.id,
                            sampleTitle: sample.title,
                          },
                        });
                        // エラーをスローしてUIにも表示
                        throw testError;
                      } else {
                        // 通常モード: 実際の削除処理
                        await deleteMutation.mutateAsync({ id: sample.id });
                      }
                    }}
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
