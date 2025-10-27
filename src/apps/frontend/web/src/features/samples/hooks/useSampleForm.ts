/**
 * サンプルフォームフック
 * カスタムReactフック
 */
'use client';

import type { ChangeEvent } from 'react';
import { useEffect } from 'react';
import { useSampleControllerGetSampleById } from '@/libs/api-client/endpoints/samples/samples';
import { useSampleStore } from '../stores/sampleStore';

/**
 * useSampleForm関数
 */
export const useSampleForm = (isEdit: boolean, id?: string) => {
  const { editedSample, setEditedSample } = useSampleStore();
  const {
    data: sampleData,
    isLoading,
    isError,
    error,
  } = useSampleControllerGetSampleById(id ?? '', { query: { enabled: isEdit && !!id } });

  useEffect(() => {
    if (isEdit && sampleData) {
      setEditedSample({ title: sampleData.data?.title ?? '' });
    } else {
      setEditedSample({ title: '' });
    }
  }, [isEdit, sampleData, setEditedSample]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedSample({ ...editedSample, [name]: value });
  };

  return { editedSample, setEditedSample, handleChange, isLoading, isError, error };
};
