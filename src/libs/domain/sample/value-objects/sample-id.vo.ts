import { z } from 'zod';

const SampleIdSchema = z.string().uuid();

export class SampleId {
  private readonly _value: string;

  constructor(value: string) {
    this._value = SampleIdSchema.parse(value);
  }

  get value(): string {
    return this._value;
  }
}
