import Link from 'next/link';
import { SampleList } from '../features/samples/components/SampleList';

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
