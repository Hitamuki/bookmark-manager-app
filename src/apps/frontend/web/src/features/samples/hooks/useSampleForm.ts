'use client';

import { useSampleControllerGetSampleById } from '@/libs/api-client/endpoints/samples/samples';
import type { SampleDto } from '@/libs/api-client/model';
import type { ChangeEvent } from 'react';
import { useEffect } from 'react';
import { useSampleStore } from '../stores/sampleStore';

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
