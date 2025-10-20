'use client';

import { useSampleControllerDeleteSampleById } from '@/libs/api-client/endpoints/samples/samples';
import type { SampleDto } from '@/libs/api-client/model';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';

export const SampleItem = ({ sample }: { sample: SampleDto }) => {
  const queryClient = useQueryClient();
  const deleteMutation = useSampleControllerDeleteSampleById({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/samples'] });
      },
    },
  });

  return (
    <li>
      <Link href={`/samples/${sample.id}`}>{sample.title}</Link>
      <button
        type="button"
        onClick={() => {
          deleteMutation.mutateAsync({ id: sample.id });
        }}
      >
        Delete
      </button>
    </li>
  );
};
