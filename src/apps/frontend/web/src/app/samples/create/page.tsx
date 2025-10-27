/**
 * page
 * モジュール定義
 */
import { SampleCreateLayout } from '@/features/samples/components/layout/SampleCreateLayout';
import { SampleForm } from '@/features/samples/components/ui/SampleForm';

export default function CreateSamplePage() {
  return (
    <SampleCreateLayout>
      <SampleForm />
    </SampleCreateLayout>
  );
}
