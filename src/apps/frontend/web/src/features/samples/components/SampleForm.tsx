'use client';

import {
  useSampleControllerCreateSample,
  useSampleControllerUpdateSampleById,
} from '@/libs/api-client/endpoints/samples/samples';
import { Button } from '@/libs/ui/generate/components/ui/button';
import { useRouter } from 'next/navigation';
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
    <form onSubmit={handleSubmit}>
      <input type="text" name="title" value={editedSample?.title ?? ''} onChange={handleChange} placeholder="Title" />
      <button type="submit">{isEdit ? 'Update' : 'Create'}</button>
      <Button onPress={() => alert('Pressed')}>Label</Button>
    </form>
  );
};
