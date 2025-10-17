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
    <li className="flex justify-between items-center border rounded-lg p-3 hover:bg-gray-50">
      <Link href={`/samples/${sample.id}`} className="text-blue-600 font-medium">
        {sample.title}
      </Link>
      <button
        type="button"
        onClick={() => {
          deleteMutation.mutateAsync({ id: sample.id });
        }}
        className="text-red-500 text-sm"
      >
        Delete
      </button>
    </li>
  );
};
