import type { CreateSampleDto } from '../dto/create-sample.dto';

export class CreateSampleCommand {
  constructor(public readonly reqBody: CreateSampleDto) {}
}
