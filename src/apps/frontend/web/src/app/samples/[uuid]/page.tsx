/**
 * page
 * モジュール定義
 */
import { SampleEditLayout } from '@/features/samples/components/layout/SampleEditLayout';
import { SampleForm } from '@/features/samples/components/ui/SampleForm';

export default async function EditSamplePage({ params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await params;
  return (
    <SampleEditLayout>
      <SampleForm isEdit id={uuid} />
    </SampleEditLayout>
  );
}
