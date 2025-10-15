'use client';

import type { ChangeEvent } from 'react';
import { useSampleStore } from '../stores/sampleStore';

export const useSampleForm = () => {
  const { editedSample, setEditedSample } = useSampleStore();

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedSample({ ...editedSample, [name]: value });
  };

  return { editedSample, setEditedSample, handleChange };
};
