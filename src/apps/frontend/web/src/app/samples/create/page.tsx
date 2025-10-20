import { SampleForm } from '@/features/samples/components/SampleForm';

export default function CreateSamplePage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Create Sample</h1>
      <SampleForm />
    </div>
  );
}
