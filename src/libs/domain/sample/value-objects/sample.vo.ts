import { z } from 'zod';

const SampleIdSchema = z.string().uuid();

export class SampleId {
  private readonly value: string;

  constructor(value: string) {
    this.value = SampleIdSchema.parse(value);
  }

  toString() {
    return this.value;
  }
}
