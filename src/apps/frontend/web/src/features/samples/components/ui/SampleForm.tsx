/**
 * サンプルフォームコンポーネント
 * UIコンポーネント
 */
'use client';

import { Button, Form, Input } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  useSampleControllerCreateSample,
  useSampleControllerUpdateSampleById,
} from '@/libs/api-client/endpoints/samples/samples';
import { useSampleForm } from '../../hooks/useSampleForm';

/**
 * SampleForm関数
 */
export const SampleForm = ({ isEdit = false, id }: { isEdit?: boolean; id?: string }) => {
  const { editedSample, setEditedSample, handleChange, isLoading, isError, error } = useSampleForm(isEdit, id);
  const router = useRouter();
  const createMutation = useSampleControllerCreateSample();
  const updateMutation = useSampleControllerUpdateSampleById();

  /**

   * handleSubmit関数

   */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    /**
     * ifメソッド
     */
    if (isEdit && id) {
      await updateMutation.mutateAsync({ id, data: { title: editedSample?.title ?? '' } });
    } else {
      await createMutation.mutateAsync({
        data: { title: editedSample?.title ?? '' },
      });
    }
    router.push('/samples');
  };

  /**

   * ifメソッド

   */

  if (isLoading) {
    return <LoadingSpinner />;
  }

  /**

   * ifメソッド

   */

  if (isError) {
    return <ErrorDisplay message={error?.message} statusCode={error?.response?.status} />;
  }

  return (
    <Form onSubmit={handleSubmit} onReset={() => setEditedSample({ title: '' })} className="flex flex-col space-y-4">
      <Input
        isRequired
        errorMessage="必須入力です"
        type="text"
        name="title"
        value={editedSample?.title ?? ''}
        onChange={handleChange}
        placeholder="Title"
        label="タイトル"
      />
      <div className="flex flex-row justify-center gap-2">
        <Button type="submit" color="primary">
          {isEdit ? 'Update' : 'Create'}
        </Button>
        <Button type="reset" variant="flat">
          Reset
        </Button>
      </div>
    </Form>
  );
};
