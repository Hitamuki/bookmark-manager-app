import Link from 'next/link';
import { SampleList } from '../../features/samples/components/SampleList';

export default function SamplesPage() {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Samples</h1>
        <Link href="/samples/create" className="bg-blue-600 text-white px-4 py-2 rounded">
          Create New
        </Link>
      </div>
      <SampleList />
    </div>
  );
}
