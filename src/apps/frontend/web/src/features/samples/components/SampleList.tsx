'use client';

import { useSampleControllerSearchSamples } from '@/libs/api-client/endpoints/samples/samples';
import type { SampleDto } from '@/libs/api-client/model';
import { SampleItem } from './SampleItem';

export const SampleList = () => {
  const { data, isLoading, isError } = useSampleControllerSearchSamples();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error fetching data</div>;
  }

  return (
    <ul className="space-y-2">
      {data?.data.data?.map((s: SampleDto) => (
        <SampleItem key={s.id} sample={s} />
      ))}
    </ul>
  );
};
