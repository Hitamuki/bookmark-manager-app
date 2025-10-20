import { SampleList } from '@/features/samples/components/SampleList';
import { Button } from '@/libs/ui/shadcn/components/ui/button';
import Link from 'next/link';

export default function SamplesPage() {
  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">Samples</h1>
        <Button asChild>
          <Link href="/samples/create">Create New</Link>
        </Button>
      </div>
      <SampleList />
    </div>
  );
}
