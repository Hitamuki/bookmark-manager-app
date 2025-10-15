'use client';

import type { Sample } from '../types/sample';
import { SampleItem } from './SampleItem';

const mockSamples: Sample[] = [
  { id: '1', title: 'Sample 1', createdAt: new Date().toISOString() },
  { id: '2', title: 'Sample 2', createdAt: new Date().toISOString() },
  { id: '3', title: 'Sample 3', createdAt: new Date().toISOString() },
];

export const SampleList = () => {
  // TODO: Replace mock data with actual data fetching
  const data = mockSamples;

  return (
    <ul className="space-y-2">
      {data?.map((s) => (
        <SampleItem key={s.id} sample={s} />
      ))}
    </ul>
  );
};
