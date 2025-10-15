import { create } from 'zustand';
import type { Sample } from '../types/sample';

type State = {
  editedSample: Partial<Sample> | null;
  setEditedSample: (sample: Partial<Sample> | null) => void;
};

export const useSampleStore = create<State>((set) => ({
  editedSample: null,
  setEditedSample: (sample) => set({ editedSample: sample }),
}));
