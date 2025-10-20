import { SampleForm } from '@/features/samples/components/SampleForm';

export default async function EditSamplePage({ params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await params;
  return (
    <div className="p-8">
      <h1 className="text-emerald-500 text-xl font-semibold mb-4">Edit Sample</h1>
      <SampleForm isEdit id={uuid} />
    </div>
  );
}
