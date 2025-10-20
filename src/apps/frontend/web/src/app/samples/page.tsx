import { SampleList } from '@/features/samples/components/SampleList';
import Link from 'next/link';

export default function SamplesPage() {
  return (
    <div>
      <div>
        <h1>Samples</h1>
        <Link href="/samples/create">Create New</Link>
      </div>
      <SampleList />
    </div>
  );
}
