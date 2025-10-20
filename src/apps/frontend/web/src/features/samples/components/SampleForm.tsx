'use client';

import {
  useSampleControllerCreateSample,
  useSampleControllerUpdateSampleById,
} from '@/libs/api-client/endpoints/samples/samples';
import { useRouter } from 'next/navigation';
import { Button } from '../../../../../../../libs/ui/shadcn/components/ui/button';
import { useSampleForm } from '../hooks/useSampleForm';

export const SampleForm = ({ isEdit = false, id }: { isEdit?: boolean; id?: string }) => {
  const { editedSample, handleChange } = useSampleForm();
  const router = useRouter();

  const createMutation = useSampleControllerCreateSample();
  const updateMutation = useSampleControllerUpdateSampleById();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit && id) {
      await updateMutation.mutateAsync({ id, data: { title: editedSample?.title ?? '' } });
    } else {
      await createMutation.mutateAsync({
        data: { title: editedSample?.title ?? '' },
      });
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
      <Button variant="outline" size="sm">
        test-button
      </Button>
    </form>
  );
};
