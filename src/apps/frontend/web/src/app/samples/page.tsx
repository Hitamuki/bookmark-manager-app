import { Button } from '@heroui/react';
import { PlusIcon } from 'lucide-react';
import Link from 'next/link';
import { SamplesLayout } from '../../features/samples/components/layout/SamplesLayout';
import { SampleList } from '../../features/samples/components/ui/SampleList';

export default function SamplesPage() {
  return (
    <SamplesLayout>
      <div className="flex justify-end">
        <Button as={Link} href="/samples/create" isIconOnly color="primary">
          <PlusIcon className="h-4 w-4" />
        </Button>
      </div>
      <SampleList />
    </SamplesLayout>
  );
}
