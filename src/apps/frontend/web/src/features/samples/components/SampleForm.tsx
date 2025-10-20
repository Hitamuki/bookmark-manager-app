'use client';

import {
  useSampleControllerCreateSample,
  useSampleControllerUpdateSampleById,
} from '@/libs/api-client/endpoints/samples/samples';
import { Button } from '@/libs/ui/shadcn/components/ui/button';
import { Input } from '@/libs/ui/shadcn/components/ui/input';
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
    <form onSubmit={handleSubmit} className="grid gap-4">
      <Input type="text" name="title" value={editedSample?.title ?? ''} onChange={handleChange} placeholder="Title" />
      <Button type="submit" variant="default" size="lg">
        {isEdit ? 'Update' : 'Create'}
      </Button>
    </form>
  );
};
