import { SampleForm } from '@/features/samples/components/SampleForm';

export default async function EditSamplePage({ params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await params;
  return (
    <div>
      <h1>Edit Sample</h1>
      <SampleForm isEdit id={uuid} />
    </div>
  );
}
