import { Button } from '@heroui/button';
import Link from 'next/link';
import { SampleList } from '../../features/samples/components/SampleList';

export default function SamplesPage() {
  return (
    <div>
      <div>
        <h1 className="text-emerald-700">Samples</h1>
        <Button as={Link} href="/samples/create" color="primary">
          Create New
        </Button>
      </div>
      <SampleList />
    </div>
  );
}
