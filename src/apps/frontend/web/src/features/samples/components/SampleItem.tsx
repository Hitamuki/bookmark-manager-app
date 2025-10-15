'use client';

import Link from 'next/link';
import type { Sample } from '../types/sample';

export const SampleItem = ({ sample }: { sample: Sample }) => {
  return (
    <li className="flex justify-between items-center border rounded-lg p-3 hover:bg-gray-50">
      <Link href={`/samples/${sample.id}`} className="text-blue-600 font-medium">
        {sample.title}
      </Link>
      <button
        type="button"
        onClick={() => {
          // TODO: Implement delete mutation
          console.log('Deleting sample:', sample.id);
        }}
        className="text-red-500 text-sm"
      >
        Delete
      </button>
    </li>
  );
};
