import { SampleForm } from '@/features/samples/components/SampleForm';

export default async function EditSamplePage({ params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await params;
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Edit Sample</h1>
      <SampleForm isEdit id={uuid} />
    </div>
  );
}
