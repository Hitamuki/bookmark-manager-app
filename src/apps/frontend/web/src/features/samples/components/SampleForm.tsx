'use client';

import { useRouter } from 'next/navigation';
import { useSampleForm } from '../hooks/useSampleForm';

export const SampleForm = ({ isEdit = false, id }: { isEdit?: boolean; id?: string }) => {
  const { editedSample, handleChange } = useSampleForm();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit && id) {
      // TODO: Implement update mutation
      // await updateMutation.mutateAsync({ id, data: editedSample! });
      console.log('Mock update:', { id, data: editedSample });
    } else {
      // TODO: Implement create mutation
      // await createMutation.mutateAsync({
      //   title: editedSample?.title ?? '',
      // });
      console.log('Mock create:', { title: editedSample?.title ?? '' });
    }
    router.push('/samples');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <input
        type="text"
        name="title"
        value={editedSample?.title ?? ''}
        onChange={handleChange}
        placeholder="Title"
        className="w-full border rounded p-2"
      />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        {isEdit ? 'Update' : 'Create'}
      </button>
    </form>
  );
};
