import type { SampleDto } from '@/libs/api-client/model';
import { create } from 'zustand';

type State = {
  editedSample: Partial<SampleDto> | null;
  setEditedSample: (sample: Partial<SampleDto> | null) => void;
};

export const useSampleStore = create<State>((set) => ({
  editedSample: null,
  setEditedSample: (sample) => set({ editedSample: sample }),
}));
